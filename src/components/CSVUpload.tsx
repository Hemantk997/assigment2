import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Upload, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";

interface CSVRecord {
  FirstName: string;
  Phone: string;
  Notes?: string;
}

const CSVUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validTypes = [
        "text/csv",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];
      
      if (!validTypes.includes(selectedFile.type) && 
          !selectedFile.name.endsWith('.csv') && 
          !selectedFile.name.endsWith('.xlsx') && 
          !selectedFile.name.endsWith('.xls')) {
        toast.error("Please upload a valid CSV or Excel file");
        return;
      }
      setFile(selectedFile);
    }
  };

  const parseFile = async (file: File): Promise<CSVRecord[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: "binary" });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet) as CSVRecord[];
          
          // Validate required fields
          const validRecords = jsonData.filter(record => 
            record.FirstName && record.Phone
          );
          
          if (validRecords.length === 0) {
            reject(new Error("No valid records found. Make sure your file has FirstName and Phone columns."));
          } else {
            resolve(validRecords);
          }
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsBinaryString(file);
    });
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    setIsUploading(true);

    try {
      // Parse the file
      const records = await parseFile(file);
      
      // Fetch all agents
      const { data: agents, error: agentsError } = await supabase
        .from("agents")
        .select("id")
        .limit(5);

      if (agentsError) throw agentsError;

      if (!agents || agents.length === 0) {
        toast.error("Please create at least one agent before uploading data");
        return;
      }

      if (agents.length < 5) {
        toast.warning(`Only ${agents.length} agents available. Records will be distributed among them.`);
      }

      // Distribute records evenly across agents
      const recordsPerAgent = Math.floor(records.length / agents.length);
      const remainder = records.length % agents.length;

      const distributedRecords = records.map((record, index) => {
        const agentIndex = Math.min(Math.floor(index / (recordsPerAgent + (index < remainder ? 1 : 0))), agents.length - 1);
        return {
          agent_id: agents[agentIndex].id,
          first_name: record.FirstName,
          phone: String(record.Phone),
          notes: record.Notes || null,
        };
      });

      // Insert all records
      const { error: insertError } = await supabase
        .from("list_items")
        .insert(distributedRecords);

      if (insertError) throw insertError;

      toast.success(`Successfully uploaded ${records.length} records and distributed them across ${agents.length} agents`);
      setFile(null);
      // Reset file input
      const fileInput = document.getElementById("file-upload") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (error: any) {
      toast.error(error.message || "Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload CSV File</CardTitle>
        <CardDescription>
          Upload a CSV, XLSX, or XLS file containing FirstName, Phone, and Notes columns.
          Records will be distributed evenly across your agents.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Input
            id="file-upload"
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            disabled={isUploading}
            className="flex-1"
          />
          <Button onClick={handleUpload} disabled={!file || isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </>
            )}
          </Button>
        </div>
        
        <div className="bg-muted p-4 rounded-lg text-sm">
          <h4 className="font-medium mb-2">File Requirements:</h4>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>File format: .csv, .xlsx, or .xls</li>
            <li>Required columns: FirstName, Phone</li>
            <li>Optional column: Notes</li>
            <li>Records will be distributed evenly across up to 5 agents</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default CSVUpload;