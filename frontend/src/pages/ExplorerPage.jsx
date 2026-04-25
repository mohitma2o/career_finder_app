import { useState, useEffect } from "react";
import { getCareers } from "../api/client";

/**
 * Career explorer page.
 * Fetches all careers from the API and allows filtering, searching, and sorting.
 */
export default function ExplorerPage() {
  const [careers, setCareers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("salary_desc");
  const [minSalary, setMinSalary] = useState(0);
  const [growth, setGrowth] = useState("Very High,High,Medium");

  useEffect(() => {
    setLoading(true);
    getCareers({
      search: search || undefined,
      category: category !== "All" ? category : undefined,
      minSalary: minSalary > 0 ? minSalary : undefined,
      growth: growth || undefined,
      sort,
    })
      .then((data) => {
        setCareers(data.careers);
        setCategories(data.categories);
        setCount(data.count);
      })
      .finally(() => setLoading(false));
  }, [search, category, sort, minSalary, growth]);

  return (
    <div className="fade-up">
      <h2 style={{ marginBottom: "0.25rem" }}>Career Database</h2>
      <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
        Browse and filter the full knowledge base of mapped careers.
      </p>

      {/* Filters */}
      <div className="grid-3" style={{ marginBottom: "1rem" }}>
        <div className="form-group">
          <label className="form-label">Search</label>
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="All">All</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Sort By</label>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="salary_desc">Salary (High to Low)</option>
            <option value="alpha">Alphabetical</option>
            <option value="growth">Growth Outlook</option>
          </select>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: "1.5rem" }}>
        <div className="form-group">
          <label className="form-label">Min Salary (INR): {minSalary > 0 ? `${(minSalary / 100000).toFixed(1)}L` : "Any"}</label>
          <input
            type="range"
            min={0}
            max={5000000}
            step={100000}
            value={minSalary}
            onChange={(e) => setMinSalary(Number(e.target.value))}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Growth Outlook</label>
          <select value={growth} onChange={(e) => setGrowth(e.target.value)}>
            <option value="Very High,High,Medium,Low">All</option>
            <option value="Very High,High,Medium">High and Above</option>
            <option value="Very High,High">Very High and High Only</option>
            <option value="Very High">Very High Only</option>
          </select>
        </div>
      </div>

      <p style={{ color: "var(--accent)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
        Showing {count} matching records
      </p>

      {loading ? (
        <p style={{ color: "var(--text-muted)" }}>Loading...</p>
      ) : (
        <div className="grid-2">
          {careers.map((c) => {
            const resources = (c.free_resources || "").split(",").map((s) => s.trim()).filter(Boolean);
            return (
              <div key={c.career} className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <h3 style={{ margin: 0, fontSize: "1.1rem" }}>{c.career}</h3>
                  <span style={{ fontWeight: 700, color: "var(--cyan)", fontSize: "0.9rem" }}>
                    INR {Number(c.avg_salary_inr || 0).toLocaleString("en-IN")}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "6px", marginBottom: "0.5rem" }}>
                  <span className="tag">{c.category}</span>
                  <span className="tag">{c.growth_outlook}</span>
                </div>
                <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginBottom: "0.5rem" }}>
                  {c.description}
                </p>
                {c.roadmap && (
                  <details className="expandable">
                    <summary>Roadmap</summary>
                    <div className="expandable-body">{c.roadmap}</div>
                  </details>
                )}
                {resources.length > 0 && (
                  <details className="expandable">
                    <summary>Free Resources</summary>
                    <div className="expandable-body">
                      <ul style={{ paddingLeft: "1rem" }}>
                        {resources.map((r, i) => <li key={i}>{r}</li>)}
                      </ul>
                    </div>
                  </details>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
