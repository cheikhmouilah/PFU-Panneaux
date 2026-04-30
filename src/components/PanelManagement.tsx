import { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromLonLat, toLonLat } from 'ol/proj';
import { Style, Circle as CircleStyle, Fill, Stroke } from 'ol/style';
import { panels as panelsApi } from '../lib/api';
import { Panel, PanelStatus, PanelCategory } from '../types/database';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Edit2, Trash2, MapPin, Search, Image as ImageIcon, X } from 'lucide-react';

const categoryToFolder: Record<string, string> = {
  'A': 'Danger',
  'B': 'Priorité',
  'C': 'Prescription',
  'D': 'Indication',
};

export default function PanelManagement() {
  const { profile } = useAuth();
  const [panels, setPanels] = useState<Panel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPanel, setEditingPanel] = useState<Panel | null>(null);

  const canEdit = profile?.role === 'admin' || profile?.role === 'responsable';

  useEffect(() => {
    loadPanels();
  }, []);

  async function loadPanels() {
    try {
      const { data } = await panelsApi.getAll();
      setPanels(data || []);
    } catch (error) {
      console.error('Error loading panels:', error);
    } finally {
      setLoading(false);
    }
  }

  async function deletePanel(id: string) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce panneau ?')) return;

    try {
      await panelsApi.delete(id);
      loadPanels();
    } catch (error) {
      console.error('Error deleting panel:', error);
      alert('Erreur lors de la suppression du panneau');
    }
  }

  const filteredPanels = panels.filter(
    (panel) =>
      panel.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      panel.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des panneaux</h2>
          <p className="text-gray-600">Inventaire et configuration des panneaux de signalisation</p>
        </div>
        {canEdit && (
          <button
            onClick={() => {
              setEditingPanel(null);
              setShowModal(true);
            }}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un panneau
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par code ou adresse..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Icône
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Adresse
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  État
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Installation
                </th>
                {canEdit && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPanels.map((panel) => (
                <tr key={panel.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{panel.code}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-8 h-8 bg-gray-50 rounded flex items-center justify-center overflow-hidden border border-gray-100">
                      <img
                        src={`/images/${categoryToFolder[panel.category]}/${panel.code}.png`}
                        alt={panel.code}
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/32?text=?';
                        }}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">Type {panel.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{panel.address || 'Non renseignée'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${panel.status === 'fonctionnel'
                        ? 'bg-green-100 text-green-800'
                        : panel.status === 'en_maintenance'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-red-100 text-red-800'
                        }`}
                    >
                      {panel.status === 'fonctionnel'
                        ? 'Fonctionnel'
                        : panel.status === 'en_maintenance'
                          ? 'Maintenance'
                          : 'Hors service'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">
                      {panel.is_intelligent ? 'Intelligent' : 'Standard'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(panel.installation_date).toLocaleDateString('fr-FR')}
                  </td>
                  {canEdit && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setEditingPanel(panel);
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {profile?.role === 'admin' && (
                        <button
                          onClick={() => deletePanel(panel.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <PanelModal
          panel={editingPanel}
          onClose={() => {
            setShowModal(false);
            setEditingPanel(null);
          }}
          onSave={() => {
            loadPanels();
            setShowModal(false);
            setEditingPanel(null);
          }}
        />
      )}
    </div>
  );
}

interface MapSelectorModalProps {
  initialLat: number;
  initialLon: number;
  onClose: () => void;
  onSelect: (lat: number, lon: number) => void;
}

function MapSelectorModal({ initialLat, initialLon, onClose, onSelect }: MapSelectorModalProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const [selectedCoords, setSelectedCoords] = useState({ lat: initialLat, lon: initialLon });

  useEffect(() => {
    if (!mapRef.current) return;

    const markerFeature = new Feature({
      geometry: new Point(fromLonLat([initialLon, initialLat])),
    });

    markerFeature.setStyle(new Style({
      image: new CircleStyle({
        radius: 8,
        fill: new Fill({ color: '#ef4444' }),
        stroke: new Stroke({ color: '#ffffff', width: 2 }),
      }),
    }));

    const vectorSource = new VectorSource({
      features: [markerFeature],
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource,
    });

    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        vectorLayer,
      ],
      view: new View({
        center: fromLonLat([initialLon, initialLat]),
        zoom: 14,
      }),
    });

    mapInstanceRef.current = map;

    map.on('click', (event) => {
      const coords = toLonLat(event.coordinate);
      const lon = coords[0];
      const lat = coords[1];

      markerFeature.setGeometry(new Point(event.coordinate));
      setSelectedCoords({ lat, lon });
    });

    // Forced update size after a few ticks to ensure it's rendered in the modal
    const timer = setInterval(() => {
      map.updateSize();
    }, 500);

    return () => {
      clearInterval(timer);
      map.setTarget(undefined);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full flex flex-col overflow-hidden h-[600px]">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">Choisir l'emplacement sur la carte</h3>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 relative bg-gray-100">
          <div ref={mapRef} className="absolute inset-0 w-full h-full" />
          <div className="absolute bottom-4 left-4 z-10 bg-white px-3 py-2 rounded-lg shadow-md border border-gray-200">
            <p className="text-xs text-gray-600 mb-1 font-medium">Coordonnées sélectionnées :</p>
            <p className="text-sm font-bold text-gray-900 font-mono">
              {selectedCoords.lat.toFixed(6)}, {selectedCoords.lon.toFixed(6)}
            </p>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (mapInstanceRef.current) {
                mapInstanceRef.current.getView().setCenter(fromLonLat([-0.6400233, 35.1875246]));
                mapInstanceRef.current.getView().setZoom(14);
              }
            }}
            className="absolute top-4 right-4 z-10 bg-white p-2 rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 text-blue-600 font-medium text-xs flex items-center"
          >
            <MapPin className="w-4 h-4 mr-1" />
            Sidi Bel Abbès
          </button>
        </div>

        <div className="p-4 bg-gray-50 flex justify-end space-x-3">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 transition-colors rounded-lg font-medium"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSelect(selectedCoords.lat, selectedCoords.lon);
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
          >
            Valider la position
          </button>
        </div>
      </div>
    </div>
  );
}

interface PanelModalProps {
  panel: Panel | null;
  onClose: () => void;
  onSave: () => void;
}

function PanelModal({ panel, onClose, onSave }: PanelModalProps) {
  const [formData, setFormData] = useState({
    code: panel?.code || '',
    category: panel?.category || 'A' as PanelCategory,
    latitude: panel?.location.coordinates[1].toString() || '35.1875246',
    longitude: panel?.location.coordinates[0].toString() || '-0.6400233',
    address: panel?.address || '',
    status: panel?.status || 'fonctionnel' as PanelStatus,
    is_intelligent: panel?.is_intelligent || false,
    installation_date: panel?.installation_date || new Date().toISOString().split('T')[0],
  });

  const [showMapSelector, setShowMapSelector] = useState(false);
  const [availableIcons, setAvailableIcons] = useState<string[]>([]);
  const [loadingIcons, setLoadingIcons] = useState(false);

  useEffect(() => {
    loadIcons();
  }, [formData.category]);

  async function loadIcons() {
    setLoadingIcons(true);
    try {
      const { data } = await panelsApi.getImageList(formData.category);
      setAvailableIcons(data || []);
    } catch (error) {
      console.error('Error loading icons:', error);
    } finally {
      setLoadingIcons(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const panelData = {
        code: formData.code,
        category: formData.category,
        location: {
          type: 'Point',
          coordinates: [parseFloat(formData.longitude), parseFloat(formData.latitude)]
        },
        address: formData.address,
        status: formData.status,
        is_intelligent: formData.is_intelligent,
        installation_date: formData.installation_date,
      };

      if (panel) {
        await panelsApi.update(panel.id, panelData);
      } else {
        await panelsApi.create(panelData);
      }

      onSave();
    } catch (error) {
      console.error('Error saving panel:', error);
      alert('Erreur lors de la sauvegarde du panneau');
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            {panel ? 'Modifier le panneau' : 'Ajouter un panneau'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code du panneau
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catégorie
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as PanelCategory })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="A">Type A (Danger)</option>
                  <option value="B">Type B (Priorité)</option>
                  <option value="C">Type C (Prescription)</option>
                  <option value="D">Type D (Indication)</option>
                </select>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-3">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <ImageIcon className="w-4 h-4 mr-2" />
                Sélectionner une icône (le code sera mis à jour)
              </label>
              {loadingIcons ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="grid grid-cols-5 gap-2 max-h-48 overflow-y-auto p-1 bg-gray-50 rounded border border-gray-100">
                  {availableIcons.map(iconFile => {
                    const iconCode = iconFile.replace(/\.[^/.]+$/, "");
                    const isSelected = formData.code === iconCode;
                    return (
                      <button
                        key={iconFile}
                        type="button"
                        onClick={() => setFormData({ ...formData, code: iconCode })}
                        className={`p-1 rounded border-2 transition-all hover:border-blue-300 ${isSelected ? 'border-blue-600 bg-blue-50' : 'border-transparent bg-white'}`}
                        title={iconCode}
                      >
                        <img
                          src={`/images/${categoryToFolder[formData.category]}/${iconFile}`}
                          alt={iconCode}
                          className="w-full h-auto aspect-square object-contain"
                        />
                      </button>
                    );
                  })}
                  {availableIcons.length === 0 && (
                    <div className="col-span-5 text-center py-4 text-gray-500 text-sm">
                      Aucune icône trouvée pour cette catégorie
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowMapSelector(true)}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center shadow-sm"
                    title="Choisir sur la carte"
                  >
                    <MapPin className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>



            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  État
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as PanelStatus })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="fonctionnel">Fonctionnel</option>
                  <option value="en_maintenance">En maintenance</option>
                  <option value="hors_service">Hors service</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date d'installation
                </label>
                <input
                  type="date"
                  value={formData.installation_date}
                  onChange={(e) => setFormData({ ...formData, installation_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_intelligent"
                checked={formData.is_intelligent}
                onChange={(e) => setFormData({ ...formData, is_intelligent: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_intelligent" className="ml-2 block text-sm text-gray-700">
                Panneau intelligent
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                {panel ? 'Mettre à jour' : 'Ajouter'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showMapSelector && (
        <MapSelectorModal
          initialLat={parseFloat(formData.latitude.replace(',', '.')) || 35.1875246}
          initialLon={parseFloat(formData.longitude.replace(',', '.')) || -0.6400233}
          onClose={() => setShowMapSelector(false)}
          onSelect={(lat, lon) => {
            setFormData({
              ...formData,
              latitude: lat.toFixed(7),
              longitude: lon.toFixed(7)
            });
            setShowMapSelector(false);
          }}
        />
      )}
    </div>
  );
}
