import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import dynamic from "next/dynamic";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const DynamicMap = dynamic(() => import("@/components/Map"), { ssr: false });

export default function GeoGamerApp() {
  const [username, setUsername] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  const [locationImage, setLocationImage] = useState("/placeholder-image.jpg");
  const [trueLocation, setTrueLocation] = useState([48.8566, 2.3522]); // Coordonnées de Paris (exemple)
  const [userGuess, setUserGuess] = useState(null);
  const [score, setScore] = useState(null);

  const startGame = () => {
    setGameStarted(true);
    setLocationImage("/random-game-location.jpg"); // À remplacer par un système d'image dynamique
    setTrueLocation([48.8566, 2.3522]); // Générer une vraie position aléatoire
    setUserGuess(null);
    setScore(null);
  };

  const handleValidate = () => {
    if (!userGuess) return;
    const distance = getDistance(userGuess, trueLocation);
    setScore(distance);
  };

  const getDistance = (guess, correct) => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (correct[0] - guess[0]) * (Math.PI / 180);
    const dLon = (correct[1] - guess[1]) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(guess[0] * (Math.PI / 180)) * Math.cos(correct[0] * (Math.PI / 180)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c); // Distance en km
  };

  function LocationMarker() {
    useMapEvents({
      click(e) {
        setUserGuess([e.latlng.lat, e.latlng.lng]);
      },
    });

    return userGuess ? <Marker position={userGuess} icon={L.icon({
      iconUrl: "/marker-icon.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41]
    })} /> : null;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6 bg-gradient-to-b from-gray-800 to-gray-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/path-to-pattern.svg')] opacity-10 pointer-events-none"></div>
      <h1 className="text-4xl font-bold mb-6 text-white shadow-lg">GeoGamer Challenge</h1>
      
      {!gameStarted ? (
        <Card className="w-full max-w-md bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-700 relative z-10">
          <CardContent>
            <Input 
              className="mb-4 text-white bg-gray-700 border border-gray-600 rounded-lg p-2" 
              placeholder="Entrez votre pseudo" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
            />
            <Tabs defaultValue="solo">
              <TabsList className="flex justify-center mb-4 bg-gray-700 p-2 rounded-lg">
                <TabsTrigger value="solo" className="text-white hover:bg-gray-600">Solo</TabsTrigger>
                <TabsTrigger value="versus" className="text-white hover:bg-gray-600">Versus</TabsTrigger>
                <TabsTrigger value="classement" className="text-white hover:bg-gray-600">Classement</TabsTrigger>
              </TabsList>
              
              <TabsContent value="solo">
                <p className="text-center text-white">Mode solo : Jouez contre la montre pour trouver l'emplacement exact.</p>
                <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white" onClick={startGame}>Jouer</Button>
              </TabsContent>
              
              <TabsContent value="versus">
                <p className="text-center text-white">Mode versus : Affrontez d'autres joueurs en temps réel.</p>
                <Button className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white">Rejoindre une partie</Button>
              </TabsContent>
              
              <TabsContent value="classement">
                <p className="text-center text-white">Consultez le classement global des meilleurs joueurs.</p>
                <Button className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white">Voir le classement</Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      ) : (
        <div className="w-full max-w-4xl bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-700 relative z-10 flex flex-col items-center">
          <img src={locationImage} alt="Lieu de jeu" className="w-full h-64 object-cover rounded-lg mb-4" />
          <MapContainer center={[20, 0]} zoom={2} className="w-full h-96 rounded-lg">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <LocationMarker />
          </MapContainer>
          <Button className="w-full mt-4 bg-yellow-600 hover:bg-yellow-700 text-white" onClick={handleValidate}>Valider</Button>
          {score !== null && <p className="text-white mt-4">Distance : {score} km</p>}
        </div>
      )}
    </div>
  );
}
