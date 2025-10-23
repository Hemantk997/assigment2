import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Upload, BarChart3 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold text-foreground">
              Agent Management System
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Streamline your operations with powerful tools to manage agents, distribute workload, and track performance.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate("/auth")} size="lg" className="text-lg px-8">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <div className="bg-card p-6 rounded-lg border space-y-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Agent Management</h3>
              <p className="text-muted-foreground">
                Create, update, and manage your agent profiles with ease.
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg border space-y-3">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <Upload className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">CSV Upload</h3>
              <p className="text-muted-foreground">
                Upload data files and automatically distribute them across your team.
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg border space-y-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Dashboard</h3>
              <p className="text-muted-foreground">
                Monitor agent performance and track assigned records in real-time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
