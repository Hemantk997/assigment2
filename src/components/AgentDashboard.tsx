import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Search } from "lucide-react";

interface Agent {
  id: string;
  name: string;
  email: string;
  mobile: string;
}

interface ListItem {
  id: string;
  first_name: string;
  phone: string;
  notes: string | null;
}

interface AgentWithItems extends Agent {
  items: ListItem[];
  itemCount: number;
}

const AgentDashboard = () => {
  const [agentsWithItems, setAgentsWithItems] = useState<AgentWithItems[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchAgentsWithItems();
  }, []);

  const fetchAgentsWithItems = async () => {
    try {
      // Fetch all agents
      const { data: agents, error: agentsError } = await supabase
        .from("agents")
        .select("*")
        .order("created_at", { ascending: false });

      if (agentsError) throw agentsError;

      // Fetch all list items
      const { data: items, error: itemsError } = await supabase
        .from("list_items")
        .select("*")
        .order("created_at", { ascending: false });

      if (itemsError) throw itemsError;

      // Combine agents with their items
      const combined = (agents || []).map((agent) => ({
        ...agent,
        items: (items || []).filter((item) => item.agent_id === agent.id),
        itemCount: (items || []).filter((item) => item.agent_id === agent.id).length,
      }));

      setAgentsWithItems(combined);
    } catch (error: any) {
      toast.error("Failed to fetch dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAgents = agentsWithItems.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Agent Dashboard</CardTitle>
          <CardDescription>View all agents and their assigned records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search agents by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            </div>
          ) : filteredAgents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? "No agents found matching your search." : "No agents found."}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredAgents.map((agent) => (
                <Card key={agent.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{agent.name}</CardTitle>
                        <CardDescription>
                          {agent.email} • {agent.mobile}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">{agent.itemCount}</div>
                        <div className="text-sm text-muted-foreground">Assigned Records</div>
                      </div>
                    </div>
                  </CardHeader>
                  {agent.items.length > 0 && (
                    <CardContent>
                      <div className="border rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>First Name</TableHead>
                              <TableHead>Phone</TableHead>
                              <TableHead>Notes</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {agent.items.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.first_name}</TableCell>
                                <TableCell>{item.phone}</TableCell>
                                <TableCell className="text-muted-foreground">
                                  {item.notes || "—"}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentDashboard;