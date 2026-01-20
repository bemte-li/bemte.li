import PocketBase from 'pocketbase';
import type { Usuario, Texto, Niusleter, Inscrito, Convite } from './types';

// Obtém a URL do PocketBase da variável de ambiente
const getPocketBaseUrl = () => {
  if (typeof window === 'undefined') {
    // Lado servidor: usa URL interna da rede Docker
    if (!process.env.POCKETBASE_INTERNAL_URL) {
      console.error('[PocketBase] Erro: variável POCKETBASE_INTERNAL_URL não definida.');
      throw new Error('POCKETBASE_INTERNAL_URL é necessária para requisições server-side.');
    }
    return process.env.POCKETBASE_INTERNAL_URL;
  }
  // Lado cliente: usa URL pública
  if (!process.env.NEXT_PUBLIC_POCKETBASE_URL) {
    console.error('[PocketBase] Erro: variável NEXT_PUBLIC_POCKETBASE_URL não definida.');
    throw new Error('NEXT_PUBLIC_POCKETBASE_URL é necessária para requisições client-side.');
  }
  return process.env.NEXT_PUBLIC_POCKETBASE_URL;
};

// Obtém a URL pública do PocketBase (para URLs de arquivos acessíveis pelo navegador)
export const getPublicPocketBaseUrl = () => {
  return process.env.NEXT_PUBLIC_POCKETBASE_URL || '';
};

/**
 * Constrói a URL completa para um arquivo do PocketBase.
 * O PocketBase armazena apenas o nome do arquivo - esta função monta a URL completa.
 * 
 * @param collectionName - Nome da coleção (ex: 'niusleteres')
 * @param recordId - ID do registro
 * @param filename - Nome do arquivo armazenado no registro
 * @returns URL completa para acessar o arquivo, ou string vazia se não houver arquivo
 */
export const getPocketBaseFileUrl = (
  collectionName: string,
  recordId: string,
  filename: string | undefined
): string => {
  if (!filename) return '';
  const baseUrl = getPublicPocketBaseUrl();
  return `${baseUrl}/api/files/${collectionName}/${recordId}/${filename}`;
};

// Instância para operações client-side
let clientSideInstance: PocketBase | null = null;

export const getClientSideInstance = () => {
  if (typeof window === 'undefined') {
    throw new Error('Instância client-side não pode ser usada no servidor');
  }
  
  if (!clientSideInstance) {
    const url = getPocketBaseUrl();
    clientSideInstance = new PocketBase(url);
  }
  
  return clientSideInstance;
};

// Para operações server-side (em Server Components ou API routes)
export const getServerSideInstance = () => {
  const url = getPocketBaseUrl();
  console.log('[PocketBase] Usando URL:', url);
  return new PocketBase(url);
};

// Tipo para dados de convite baseado no schema da coleção
export interface ConviteData {
  email?: string;
  nome?: string;
  sobre?: string;
}

// Tipo para dados de inscrito baseado no schema da coleção
export interface InscritoData {
  email: string;
  nota?: string;
  niusleter: string;
}

// Funções de API
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
