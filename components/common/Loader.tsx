import React from "react";
import { Loader2 } from "lucide-react";

const Loader = () => {
  return (
    <div className="flex items-center justify-center min-h-100">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-orange-600 mx-auto" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
};
export default Loader;
