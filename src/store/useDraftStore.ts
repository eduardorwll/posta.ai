import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ProductCategory, ProductCondition } from '@/types/product';
import type { GridPhoto } from '@/components/PhotoGrid';

const DRAFT_STORAGE_KEY = 'posta_ai_product_draft';
const MAX_PHOTOS = 5;

export interface DraftState {
  nome: string;
  condicao: ProductCondition;
  categoria: ProductCategory;
  price: string;
  notes: string;
  photos: GridPhoto[];

  setNome: (nome: string) => void;
  setCondicao: (condicao: ProductCondition) => void;
  setCategoria: (categoria: ProductCategory) => void;
  setPrice: (price: string) => void;
  setNotes: (notes: string) => void;
  setPhotos: (photos: GridPhoto[]) => void;
  addPhotos: (newPhotos: GridPhoto[]) => void;
  removePhoto: (id: string) => void;
  clearDraft: () => void;
}

const initialState = {
  nome: '',
  condicao: 'usado' as ProductCondition,
  categoria: 'diversos' as ProductCategory,
  price: '',
  notes: '',
  photos: [] as GridPhoto[],
};

export const useDraftStore = create<DraftState>()(
  persist(
    (set) => ({
      ...initialState,

      setNome: (nome: string) => set({ nome }),
      setCondicao: (condicao: ProductCondition) => set({ condicao }),
      setCategoria: (categoria: ProductCategory) => set({ categoria }),
      setPrice: (price: string) => set({ price }),
      setNotes: (notes: string) => set({ notes }),
      setPhotos: (photos: GridPhoto[]) => set({ photos: photos.slice(0, MAX_PHOTOS) }),
      addPhotos: (newPhotos: GridPhoto[]) =>
        set((state) => {
          const existingUris = new Set(state.photos.map((p) => p.uri));
          const uniqueNewPhotos = newPhotos.filter((p) => !existingUris.has(p.uri));
          return {
            photos: [...state.photos, ...uniqueNewPhotos].slice(0, MAX_PHOTOS),
          };
        }),
      removePhoto: (id: string) =>
        set((state) => ({
          photos: state.photos.filter((photo) => photo.id !== id),
        })),
      clearDraft: () => set(initialState),
    }),
    {
      name: DRAFT_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
