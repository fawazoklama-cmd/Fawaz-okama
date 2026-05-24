export type Language = 'en' | 'id';

export interface Profile {
  id: string;
  username: string;
  avatarShape: 'circle' | 'square' | 'cloud' | 'blob';
  avatarColor: string; // Hex color or simple tailwind class indicator
  emoji: string;
}

export interface Player extends Profile {
  isHost: boolean;
  isMicOn: boolean;
  usePTT: boolean;
  isSpeaking: boolean;
  score: number;
  lastActive: number;
}

export type GameCategory = 'puzzle' | 'reaction' | 'casual' | 'strategy' | 'party';

export interface GameMetadata {
  id: number;
  titleEN: string;
  titleID: string;
  descriptionEN: string;
  descriptionID: string;
  rulesEN: string;
  rulesID: string;
  winConditionEN: string;
  winConditionID: string;
  category: GameCategory;
}

export interface RoomState {
  code: string;
  players: Player[];
  activeGameId: number | null;
  gameState: any; // Dynamic state updated based on game actions
  chat: ChatMessage[];
  lastUpdated: number;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  username: string;
  color: string;
  text: string;
  timestamp: number;
}
