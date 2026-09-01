import { Settings as SettingsIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminSettings() {
  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Platform Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="text-sm font-medium">Platform Name</p>
                <p className="text-xs text-muted-foreground">MarketHub</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="text-sm font-medium">Default Currency</p>
                <p className="text-xs text-muted-foreground">TZS (Tanzanian Shilling)</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="text-sm font-medium">Seller Verification</p>
                <p className="text-xs text-muted-foreground">Manual review required</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
