import { useEffect, useState } from 'react';
import { Clapperboard, Loader2 } from 'lucide-react';
import type { StudioData } from '@/lib/types';
import type { CanvasNode, CanvasEdge } from '@/lib/canvas-db';
import { loadStudioData } from '@/lib/db';
import { storageMode } from '@/lib/supabase';
import { loadCanvas } from '@/lib/canvas-db';
import ProjectBible from '@/components/ProjectBible';
import AssetBible from '@/components/AssetBible';
import Episodes from '@/components/Episodes';
import ShotList from '@/components/ShotList';
import DirectorCanvas from '@/components/canvas/DirectorCanvas';
import ProductionPipeline from '@/components/pipeline/ProductionPipeline';

type Tab = 'bible' | 'assets' | 'episodes' | 'shots' | 'canvas' | 'production';

const TABS: { id: Tab; label: string }[] = [
  { id: 'canvas', label: 'AI Canvas' },
  { id: 'bible', label: 'Series Bible' },
  { id: 'assets', label: 'Asset Bible' },
  { id: 'episodes', label: 'Episode' },
  { id: 'shots', label: 'Shot List' },
  { id: 'production', label: 'Produksi' },
];

export default function Studio() {
  const [data, setData] = useState<StudioData | null>(null);
  const [canvas, setCanvas] = useState<{ nodes: CanvasNode[]; edges: CanvasEdge[] }>({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(localStorage.getItem('bekal-film-active-project'));
  const [tab, setTab] = useState<Tab>(() => TABS.find(t => t.id === location.hash.slice(1))?.id ?? 'bible');
  const [shotsEpisodeId, setShotsEpisodeId] = useState<string | null>(null);

  const refresh = async () => {
    try {
      const d = await loadStudioData();
      setData(d);
      if (activeProjectId) setCanvas(await loadCanvas(activeProjectId));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProjectId]);

  useEffect(() => { if (activeProjectId) localStorage.setItem('bekal-film-active-project', activeProjectId); else localStorage.removeItem('bekal-film-active-project'); }, [activeProjectId]);
  useEffect(() => { window.history.replaceState(null, '', '#'+tab); }, [tab]);
  useEffect(() => { document.getElementById('studio-fallback')?.remove(); }, []);

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="flex items-center gap-3 text-zinc-500">
          <Loader2 className="animate-spin" size={20} />
          <span className="text-sm" role="status">{error ?? 'Memuat studio...'}</span>{error && <button onClick={refresh} className="border rounded p-2">Coba lagi</button>}
        </div>
      </div>
    );
  }

  const project = data.projects.find((p) => p.id === activeProjectId) ?? null;
  const scope = <T extends { project_id: string },>(rows: T[]) => rows.filter(r => r.project_id === activeProjectId);
  const d: StudioData = { ...data, characters: scope(data.characters), wardrobes: scope(data.wardrobes), locations: scope(data.locations), props: scope(data.props), episodes: scope(data.episodes), scenes: scope(data.scenes), shots: scope(data.shots), keyframes: scope(data.keyframes) };
  const episode = d.episodes.find((e) => e.id === shotsEpisodeId) ?? null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-white/10 bg-zinc-950/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="flex flex-wrap items-center gap-3 min-h-14 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-zinc-950">
              <Clapperboard size={17} strokeWidth={2.2} />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-sm font-bold tracking-tight leading-none">Cinematic Series Director</h1>
              <p className="text-[10px] text-zinc-500 leading-none mt-1">Ide → Bible → Episode → Shot → Prompt</p>
            </div>
            <a href="/index.html" className="ml-auto shrink-0 text-xs text-zinc-400 hover:text-amber-400">Beranda Bekal</a>
            {d.projects.length > 0 && (
              <select
                aria-label="Proyek aktif"
                value={activeProjectId ?? ''}
                onChange={(e) => { setActiveProjectId(e.target.value || null); setShotsEpisodeId(null); setTab('bible'); }}
                className="bg-white/[0.04] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500/60 [&>option]:bg-zinc-900 max-w-[200px] truncate"
              >
                <option value="">— Pilih Proyek —</option>
                {d.projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            )}
          </div>
          {project && (
            <nav className="flex gap-1 -mb-px overflow-x-auto">
              {TABS.map((t) => (
                <button key={t.id} onClick={() => { setTab(t.id); if (t.id !== 'shots') setShotsEpisodeId(null); }}
                  className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                    tab === t.id ? 'border-amber-500 text-amber-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}>
                  {t.label}
                </button>
              ))}
            </nav>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
        <p className="mb-4 text-xs text-zinc-500">{storageMode === "local" ? "Proyek tersimpan otomatis di browser perangkat ini." : "Proyek terhubung ke penyimpanan cloud."} Gambar dan video lokal adalah storyboard / animatic; prompt tersedia untuk layanan AI pilihanmu.</p>
        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}
        {!project ? (
          <ProjectBible key={activeProjectId ?? "new"}
            project={null}
            hasProjects={d.projects.length > 0}
            onCreated={(p) => { setActiveProjectId(p.id); refresh(); }}
            onUpdated={() => refresh()}
            onDeleted={() => { setActiveProjectId(null); refresh(); }}
          />
        ) : (
          <>
            {tab === 'canvas' && (
              <DirectorCanvas
                project={project}
                data={d}
                nodes={canvas.nodes}
                edges={canvas.edges}
                refresh={refresh}
              />
            )}
            {tab === 'production' && (
              <ProductionPipeline key={project.id}
                project={project}
                data={d}
                refresh={refresh}
              />
            )}
            {tab === 'bible' && (
              <ProjectBible key={activeProjectId ?? "new"}
                project={project}
                hasProjects
                onCreated={(p) => { setActiveProjectId(p.id); refresh(); }}
                onUpdated={() => refresh()}
                onDeleted={() => { setActiveProjectId(null); refresh(); }}
              />
            )}
            {tab === 'assets' && (
              <AssetBible
                project={project}
                characters={d.characters}
                wardrobes={d.wardrobes}
                locations={d.locations}
                props={d.props}
                refresh={refresh}
              />
            )}
            {tab === 'episodes' && (
              <Episodes
                project={project}
                episodes={d.episodes}
                scenes={d.scenes}
                shots={d.shots}
                characters={d.characters}
                wardrobes={d.wardrobes}
                refresh={refresh}
                onOpenShots={(ep) => { setShotsEpisodeId(ep.id); setTab('shots'); }}
              />
            )}
            {tab === 'shots' && (
              episode ? (
                <ShotList
                  project={project}
                  episode={episode}
                  scenes={d.scenes.filter((s) => s.episode_id === episode.id)}
                  shots={d.shots}
                  characters={d.characters}
                  wardrobes={d.wardrobes}
                  locations={d.locations}
                  refresh={refresh}
                  onBack={() => { setShotsEpisodeId(null); setTab('episodes'); }}
                />
              ) : (
                <div className="rounded-xl border border-dashed border-white/10 py-16 text-center text-sm text-zinc-500">
                  Pilih episode lewat tab Episode untuk membuka shot list.
                </div>
              )
            )}
          </>
        )}
      </main>
    </div>
  );
}
