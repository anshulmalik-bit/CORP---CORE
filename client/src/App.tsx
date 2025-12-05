import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { SessionProvider } from "@/lib/context";

import Home from "@/pages/Home";
import PreScreen from "@/pages/PreScreen";
import ResumeUpload from "@/pages/ResumeUpload";
import Interview from "@/pages/Interview";
import Verdict from "@/pages/Verdict";
import History from "@/pages/History";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/prescreen" component={PreScreen} />
      <Route path="/resume" component={ResumeUpload} />
      <Route path="/interview" component={Interview} />
      <Route path="/verdict" component={Verdict} />
      <Route path="/history" component={History} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <Toaster />
        <Router />
      </SessionProvider>
    </QueryClientProvider>
  );
}

export default App;
