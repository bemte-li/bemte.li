import PocketBase from 'pocketbase';

// Get the PocketBase URL from environment variable or use fallback
const getPocketBaseUrl = () => {
  const url = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';
  
  return url;
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
  return new PocketBase(getPocketBaseUrl());
};

// Type for convite data based on the collection schema
export interface ConviteData {
  email?: string;
  nome?: string;
  sobre?: string;
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