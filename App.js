import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { Audio } from 'expo-av'; // Voor het geluid

const INITIAL_TERMS = [
  "Eden", "Armageddon", "Noach", "Tabernakel", "Silo", "Nebukadnezar", 
  "Efeze", "Genezareth", "Manna", "Melchizedek", "Gibeon", "Loflied",
  "Pionier", "Koninkrijkszaal", "Gedachtenisviering", "Abraham", "Sara", 
  "Zacheüs", "Olijfberg", "Golgotha", "Pentecoste", "Vloed", "Regenboog",
  "Samaritaan", "Jeruzalem", "Babel", "Mizpa", "Bethel", "Ur", "Eufraat"
];

export default function App() {
  const [availableTerms, setAvailableTerms] = useState([...INITIAL_TERMS]);
  const [team1Score, setTeam1Score] = useState(0);
  const [team2Score, setTeam2Score] = useState(0);
  const [currentTeam, setCurrentTeam] = useState(1);
  const [items, setItems] = useState([]);
  const [timer, setTimer] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isScoring, setIsScoring] = useState(false);
  const [sound, setSound] = useState();

  // Geluid inladen en afspelen
  async function playBuzzer() {
    const { sound } = await Audio.Sound.createAsync(
      { uri: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3' } // Een helder bel-geluid
    );
    setSound(sound);
    await sound.playAsync();
  }

  // Opruimen van geluid uit geheugen
  useEffect(() => {
    return sound ? () => { sound.unloadAsync(); } : undefined;
  }, [sound]);

  const startRound = () => {
    if (availableTerms.length < 5) {
      Alert.alert("Lijst leeg", "Alle termen zijn gebruikt! We beginnen weer opnieuw.");
      setAvailableTerms([...INITIAL_TERMS]);
      return;
    }

    // Pak 5 unieke termen
    const shuffled = [...availableTerms].sort(() => 0.5 - Math.random());
    const roundItems = shuffled.slice(0, 5);
    
    // Update de lijst met overgebleven termen
    setAvailableTerms(availableTerms.filter(t => !roundItems.includes(t)));
    
    setItems(roundItems);
    setTimer(30);
    setIsReady(true);
    setIsScoring(false);
  };

  const startTimer = () => {
    setIsReady(false);
    setIsPlaying(true);
  };

  useEffect(() => {
    let interval;
    if (isPlaying && timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    } else if (timer === 0 && isPlaying) {
      setIsPlaying(false);
      setIsScoring(true);
      playBuzzer(); // Speel geluid af!
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying, timer]);

  const addScore = (points) => {
    if (currentTeam === 1) setTeam1Score(team1Score + points);
    else setTeam2Score(team2Score + points);
    setCurrentTeam(currentTeam === 1 ? 2 : 1);
    setIsScoring(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.scoreBoard}>
        <Text style={styles.scoreText}>T1: {team1Score} | T2: {team2Score}</Text>
        <Text style={styles.termsLeft}>Termen over: {availableTerms.length}</Text>
      </View>

      {!isReady && !isPlaying && !isScoring && (
        <TouchableOpacity style={styles.button} onPress={startRound}>
          <Text style={styles.buttonText}>Volgende Ronde (Team {currentTeam})</Text>
        </TouchableOpacity>
      )}

      {isReady && (
        <TouchableOpacity style={styles.buttonStart} onPress={startTimer}>
          <Text style={styles.buttonText}>START TIMER</Text>
        </TouchableOpacity>
      )}

      {isPlaying && (
        <View style={styles.gameBox}>
          <Text style={styles.timerText}>{timer}</Text>
          {items.map((item, i) => <Text key={i} style={styles.itemText}>{item}</Text>)}
        </View>
      )}

      {isScoring && (
        <View style={styles.scoreButtons}>
          <Text style={styles.infoText}>Hoeveel punten voor Team {currentTeam === 1 ? 1 : 2}?</Text>
          {[0, 1, 2, 3, 4, 5].map(num => (
            <TouchableOpacity key={num} style={styles.smallButton} onPress={() => addScore(num)}>
              <Text style={styles.buttonText}>{num}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f7', alignItems: 'center', justifyContent: 'center' },
  scoreBoard: { position: 'absolute', top: 60, alignItems: 'center' },
  scoreText: { fontSize: 24, fontWeight: 'bold', color: '#2c3e50' },
  termsLeft: { fontSize: 14, color: '#7f8c8d' },
  gameBox: { alignItems: 'center', backgroundColor: '#fff', padding: 30, borderRadius: 20, elevation: 5 },
  timerText: { fontSize: 80, fontWeight: 'bold', color: '#e74c3c', marginBottom: 20 },
  itemText: { fontSize: 28, marginVertical: 5, color: '#2c3e50' },
  button: { backgroundColor: '#2ecc71', padding: 20, borderRadius: 10 },
  buttonStart: { backgroundColor: '#e67e22', padding: 20, borderRadius: 10 },
  buttonText: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  scoreButtons: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', padding: 20 },
  smallButton: { backgroundColor: '#3498db', width: 55, height: 55, margin: 8, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  infoText: { width: '100%', textAlign: 'center', fontSize: 20, marginBottom: 15 }
});
