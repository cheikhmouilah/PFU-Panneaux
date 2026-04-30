import { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromLonLat } from 'ol/proj';
import { Style, Circle as CircleStyle, Fill, Stroke, Text } from 'ol/style';

import { panels as panelsApi } from '../lib/api';
import { Panel, PanelStatus } from '../types/database';
import { Filter, X } from 'lucide-react';

export default function MapView() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const vectorLayerRef = useRef<VectorLayer<VectorSource> | null>(null);

  const [panels, setPanels] = useState<Panel[]>([]);
  const [selectedPanel, setSelectedPanel] = useState<Panel | null>(null);
  const [filterStatus, setFilterStatus] = useState<PanelStatus | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  /* =========================
     INITIALISATION CARTE
     ========================= */
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: fromLonLat([-0.6400233, 35.1875246]), // Sidi Bel Abbès
        zoom: 13,
      }),
    });

    map.on('click', (evt) => {
      const feature = map.forEachFeatureAtPixel(evt.pixel, (f) => f);
      setSelectedPanel(feature ? (feature.get('panel') as Panel) : null);
    });

    mapInstanceRef.current = map;

    // Important avec Tailwind / layout dynamique
    setTimeout(() => map.updateSize(), 100);

    return () => {
      map.setTarget(undefined);
      mapInstanceRef.current = null;
    };
  }, []);

  /* =========================
     CHARGEMENT DES PANNEAUX
     ========================= */
  useEffect(() => {
    loadPanels();
  }, [filterStatus, filterCategory]);

  async function loadPanels() {
    try {
      const { data } = await panelsApi.getAll();
      let filteredData = data || [];

      if (filterStatus !== 'all') {
        filteredData = filteredData.filter((p: Panel) => p.status === filterStatus);
      }
      if (filterCategory !== 'all') {
        filteredData = filteredData.filter((p: Panel) => p.category === filterCategory);
      }

      setPanels(filteredData);
    } catch (err) {
      console.error('Erreur chargement panneaux:', err);
    }
  }

  /* =========================
     AFFICHAGE DES PANNEAUX
     ========================= */
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (vectorLayerRef.current) {
      mapInstanceRef.current.removeLayer(vectorLayerRef.current);
    }

    const source = new VectorSource();

    panels.forEach((panel) => {
      if (!panel.location?.coordinates) return;

      const [lon, lat] = panel.location.coordinates;

      const feature = new Feature({
        geometry: new Point(fromLonLat([lon, lat])),
        panel,
      });

      feature.setStyle(getPanelStyle(panel));
      source.addFeature(feature);
    });

    const vectorLayer = new VectorLayer({ source });
    mapInstanceRef.current.addLayer(vectorLayer);
    vectorLayerRef.current = vectorLayer;
  }, [panels]);

  /* =========================
     STYLE DES PANNEAUX
     ========================= */
  function getPanelStyle(panel: Panel): Style {
    let color = '#10b981';
    if (panel.status === 'en_maintenance') color = '#f59e0b';
    if (panel.status === 'hors_service') color = '#ef4444';

    return new Style({
      image: new CircleStyle({
        radius: panel.is_intelligent ? 8 : 6,
        fill: new Fill({ color }),
        stroke: new Stroke({ color: '#ffffff', width: 2 }),
      }),
      text: new Text({
        text: panel.code,
        offsetY: -15,
        font: '12px sans-serif',
        fill: new Fill({ color: '#1f2937' }),
        stroke: new Stroke({ color: '#ffffff', width: 3 }),
      }),
    });
  }

  /* =========================
     RENDER
     ========================= */
  return (
    <div className="space-y-4 relative">
      {/* HEADER + BOUTON */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Carte SIG</h2>
          <p className="text-gray-600">
            Localisation des panneaux de signalisation
          </p>
        </div>

        {/* ✅ SOLUTION 1 — Z-INDEX */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="relative z-50 flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filtres
        </button>
      </div>

      {/* FILTRES */}
      {showFilters && (
        <div className="relative z-50 bg-white rounded-xl shadow border p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value as PanelStatus | 'all')
              }
              className="border rounded px-3 py-2"
            >
              <option value="all">Tous</option>
              <option value="fonctionnel">Fonctionnel</option>
              <option value="en_maintenance">En maintenance</option>
              <option value="hors_service">Hors service</option>
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="all">Toutes</option>
              <option value="A">Type A</option>
              <option value="B">Type B</option>
              <option value="C">Type C</option>
              <option value="D">Type D</option>
            </select>
          </div>
        </div>
      )}

      {/* CARTE */}
      <div
        ref={mapRef}
        className="relative z-0 w-full h-[600px] rounded-xl border shadow-lg"
      />

      {/* POPUP INFO */}
      {selectedPanel && (
        <div className="absolute top-6 right-6 z-50 bg-white rounded-xl shadow-xl border p-4 max-w-sm">
          <div className="flex justify-between mb-2">
            <h3 className="font-semibold">{selectedPanel.code}</h3>
            <button onClick={() => setSelectedPanel(null)}>
              <X className="w-4 h-4" />
            </button>
          </div>

          <p><b>Catégorie :</b> {selectedPanel.category}</p>
          <p><b>État :</b> {selectedPanel.status}</p>
          <p><b>Type :</b> {selectedPanel.is_intelligent ? 'Intelligent' : 'Standard'}</p>
        </div>
      )}
    </div>
  );
}
