import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000/api`;

const categoryToFolder: Record<string, string> = {
    'A': 'Danger',
    'B': 'Priorité',
    'C': 'Prescription',
    'D': 'Indication',
};

export default function PanelDisplay() {
    const [panel, setPanel] = useState<{ id: string; code: string; category: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Get panel ID from URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const panelId = urlParams.get('display');

    useEffect(() => {
        if (!panelId) {
            setError('Aucun identifiant de panneau fourni');
            setLoading(false);
            return;
        }

        const fetchPanelState = async () => {
            try {
                const response = await axios.get(`${API_URL}/panels/public/${panelId}`);
                setPanel(response.data);
                setError(null);
            } catch (err) {
                console.error('Error fetching panel state:', err);
                setError('Erreur de connexion au panneau');
            } finally {
                setLoading(false);
            }
        };

        fetchPanelState();

        // Poll for changes every 2 seconds
        const interval = setInterval(fetchPanelState, 2000);

        return () => clearInterval(interval);
    }, [panelId]);

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
        );
    }

    if (error || !panel) {
        return (
            <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-white p-4 text-center">
                <p className="text-xl mb-4 text-red-400">{error || 'Panneau introuvable'}</p>
                <p className="text-sm opacity-50">Vérifiez l'URL de simulation</p>
            </div>
        );
    }

    const getFolderFromCode = (code: string): string => {
        if (!code) return 'Indication';
        const firstChar = code.charAt(0).toUpperCase();
        return categoryToFolder[firstChar] || 'Indication';
    };

    const folder = panel ? getFolderFromCode(panel.code) : 'Indication';
    const imagePath = panel ? `/images/${folder}/${panel.code}.png` : '';

    return (
        <div className="fixed inset-0 bg-black flex flex-col items-center justify-center p-0 m-0 overflow-hidden select-none">
            <div className="w-full h-full flex items-center justify-center">
                <img
                    src={imagePath}
                    alt={panel.code}
                    className="w-full h-full object-contain animate-fade-in"
                    key={panel.code} // Force re-animation on code change
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600?text=Sign+Not+Found';
                    }}
                />
            </div>

            {/* Subtle ID overlay for verification, fades out */}
            <div className="absolute bottom-2 right-2 text-[10px] text-white opacity-20 font-mono">
                ID: {panel.id.substring(0, 8)} | Code: {panel.code}
            </div>

            <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
        </div>
    );
}
