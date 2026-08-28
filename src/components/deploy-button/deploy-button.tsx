import { useState } from "react";
import { toast } from "sonner";
import { Download } from "lucide-react";

import LoadButton from "../load-button/load-button";
import Loading from "../loading/loading";
import { Button } from "../ui/button";
import { exportProjectZip } from "../../utils/exportZip";

function DeployButton({
  html,
  setHtml,
}: {
  html: string;
  setHtml: (html: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  const exportZip = async () => {
    if (!html.trim()) {
      toast.error("There is no website to export.");
      return;
    }

    setLoading(true);

    try {
      await exportProjectZip(html);
      toast.success("Website exported successfully.");
    } catch (error) {
      console.error("ZIP export error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to export the website."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-5">
      <LoadButton setHtml={setHtml} />

      <Button
        variant="pink"
        onClick={exportZip}
        disabled={loading || !html.trim()}
        className="max-lg:hidden"
      >
        <Download className="size-4" />
        Export ZIP
        {loading && <Loading />}
      </Button>

      <Button
        variant="pink"
        size="sm"
        onClick={exportZip}
        disabled={loading || !html.trim()}
        className="lg:hidden"
      >
        <Download className="size-4" />
        ZIP
        {loading && <Loading />}
      </Button>
    </div>
  );
}

export default DeployButton;
