import PocketBase from 'pocketbase';
import type { Usuario, Texto, Niusleter, Inscrito, Convite } from './types';

// Get the PocketBase URL from environment variable or use fallback
const getPocketBaseUrl = () => {
  if (typeof window === 'undefined') {
    // Server-side: use internal Docker network URL
    if (!process.env.POCKETBASE_INTERNAL_URL) {
      console.error('[PocketBase] Error: POCKETBASE_INTERNAL_URL environment variable is not set.');
      throw new Error('POCKETBASE_INTERNAL_URL environment variable is required for server-side PocketBase requests.');
    }
    return process.env.POCKETBASE_INTERNAL_URL;
  }
  // Client-side: use public URL
  if (!process.env.NEXT_PUBLIC_POCKETBASE_URL) {
    console.error('[PocketBase] Error: NEXT_PUBLIC_POCKETBASE_URL environment variable is not set.');
    throw new Error('NEXT_PUBLIC_POCKETBASE_URL environment variable is required for client-side PocketBase requests.');
  }
  return process.env.NEXT_PUBLIC_POCKETBASE_URL;
};

// For client-side operations
let clientSideInstance: PocketBase | null = null;

export const getClientSideInstance = () => {
  if (typeof window === 'undefined') {
    throw new Error('Client-side PocketBase instance cannot be used server-side');
  }
  
  if (!clientSideInstance) {
    const url = getPocketBaseUrl();
    clientSideInstance = new PocketBase(url);
  }
  
  return clientSideInstance;
};

// For server-side operations (in Server Components or API routes)
export const getServerSideInstance = () => {
  const url = getPocketBaseUrl();
  console.log('[PocketBase] Using URL:', url);
  return new PocketBase(url);
};

// Type for convite data based on the collection schema
export interface ConviteData {
  email?: string;
  nome?: string;
  sobre?: string;
}

// Type for inscrito data based on the collection schema
export interface InscritoData {
  email: string;
  nota?: string;
  niusleter: string;
}

// API functions
export const createConvite = async (data: ConviteData) => {
  const pb = getClientSideInstance();
  try {
    const record = await pb.collection('convites').create(data);
    return record;
  } catch (error) {
    console.error('Error creating convite:', error);
    throw error;
  }
};

export const createInscricao = async (data: InscritoData) => {
  const pb = getClientSideInstance();
  try {
    const record = await pb.collection('inscritos').create(data);
    return record;
  } catch (error) {
    console.error('Error creating inscricao:', error);
    throw error;
  }
};

export const getTextosByNiusleter = async (niusleterId: string): Promise<Texto[]> => {
  const pb = getServerSideInstance();
  try {
    console.log('[PocketBase] Fetching textos by niusleterId:', niusleterId);
    const textos = await pb.collection('textos').getFullList<Texto>({
      filter: `niusleter="${niusleterId}"`,
      expand: 'niusleter,niusleter.usuario',
      sort: '-created',
    });
    console.log('[PocketBase] Textos found:', textos);
    return textos;
  } catch (error) {
    console.error('[PocketBase] Error fetching textos by niusleterId:', error);
    throw error;
  }
};

export const getTextoByPath = async (path: string): Promise<Texto> => {
  const pb = getServerSideInstance();
  try {
    console.log('[PocketBase] Fetching texto by path:', path);
    const texto = await pb.collection('textos').getFirstListItem<Texto>(`caminho="${path}"`, {
      expand: 'niusleter,niusleter.usuario',
    });
    console.log('[PocketBase] Texto found:', texto);
    return texto;
  } catch (error) {
    console.error('[PocketBase] Error fetching texto by path:', error);
    throw error;
  }
};


export const getNiusleterByPath = async (path: string): Promise<Niusleter> => {
  const pb = getServerSideInstance();
  try {
    const niusleter = await pb.collection('niusleteres').getFirstListItem<Niusleter>(`caminho="${path}"`, {
      expand: 'usuario',
    });
    return niusleter;
  } catch (error) {
    console.error('[PocketBase] Error fetching niusleter by path:', error);
    throw error;
  }
};
