import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { login as apiLogin, saveAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { ChartLine } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginForm) => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError("");
    
    try {
      const authData = await apiLogin(data.email, data.password);
      saveAuth(authData);
      login(authData.user);
      
      // Small delay to ensure auth context is updated
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Redirect based on user role
      if (authData.user.role === "ADMIN") {
        setLocation("/admin");
      } else {
        setLocation("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-14 h-14 bg-black rounded-lg flex items-center justify-center mx-auto mb-4 p-1">
            {/* <ChartLine className="text-white h-6 w-6" /> */}
            <img src="https://expertdojo.com/wp-content/uploads/2022/05/ED_Logo-White.png"/>

          </div>
          <CardTitle className="text-2xl font-bold text-slate-800">
          Expert Dojo
          </CardTitle>
          <p className="text-slate-600">Sign in to your account</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...form.register("email")}
                className="h-12"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                {...form.register("password")}
                className="h-12"
              />
              {form.formState.errors.password && (
                <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
              )}
            </div>
            
            <Button
              type="submit"
              className="w-full h-12 font-medium"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            {/* <p className="text-xs text-slate-500">
              Contact admin for account creation
            </p> */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
