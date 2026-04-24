import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../components/ui/Loader";

type DiscoveryListItem = {
  id: number;
  title: string;
  status: string;
  discovery_status: string;
  discovered_at: string;
  updated_at?: string | null;
};

const DISCOVERY_API_BASE = "http://127.0.0.1:3001/api/discovery";

export default function ReviewDiscoveredExamsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<DiscoveryListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadItems() {
      try {
        const response = await fetch(DISCOVERY_API_BASE);
        if (!response.ok) {
          throw new Error("Failed to load discovered exams");
        }

        const data = await response.json();
        if (!cancelled) {
          setItems(data.items ?? []);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Failed to load discovered exams");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadItems();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#060e1a", color: "#e2e8f0", fontFamily: "'DM Sans', 'Segoe UI', sans-serif", padding: "32px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: "0.15em", color: "#f59e0b", fontWeight: 800, textTransform: "uppercase" }}>Review Queue</div>
            <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>Discovered Exams Ready For Review</div>
          </div>
          <button
            type="button"
            onClick={() => navigate("/admin")}
            style={{ padding: "10px 18px", borderRadius: 8, border: "1px solid #1e3a5f", background: "transparent", color: "#93c5fd", cursor: "pointer" }}
          >
            Open Empty Admin Form
          </button>
        </div>

        {loading && <Loader text="Loading review queue" />}
        {error && <div style={{ color: "#fca5a5" }}>{error}</div>}
        {!loading && !error && items.length === 0 && <div style={{ color: "#94a3b8" }}>No discovered exams are waiting for review.</div>}

        {!loading && !error && items.length > 0 && (
          <div style={{ display: "grid", gap: 14 }}>
            {items.map((item) => (
              <div key={item.id} style={{ background: "#0f1e35", border: "1px solid #1e3a5f", borderRadius: 12, padding: 18, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 18 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#f8fafc" }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 6 }}>
                    Review Status: {item.status} | Discovery Status: {item.discovery_status}
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                    Discovered: {new Date(item.discovered_at).toLocaleString()}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/admin?discoveryId=${item.id}`)}
                  style={{ padding: "10px 18px", borderRadius: 8, border: "none", background: "#f59e0b", color: "#000", fontWeight: 800, cursor: "pointer" }}
                >
                  Review
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
