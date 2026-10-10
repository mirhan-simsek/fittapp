import { FoodItem } from '../types';

const f = (id: string, name: string, per: string, kcal: number, protein: number, carbs: number, fat: number): FoodItem => ({
  id, name, per, kcal, protein, carbs, fat,
});

// Değerler yaklaşıktır; ürün/marka ve pişirme yöntemine göre değişir.
export const foods: FoodItem[] = [
  // Protein kaynakları
  f('chicken', 'Tavuk göğsü (pişmiş)', '100 g', 165, 31, 0, 3.6),
  f('beef-mince', 'Dana kıyma (pişmiş)', '100 g', 250, 26, 0, 15),
  f('tuna', 'Ton balığı (suda)', '100 g', 116, 26, 0, 1),
  f('salmon', 'Somon', '100 g', 208, 20, 0, 13),
  f('egg', 'Yumurta', '1 adet', 72, 6.3, 0.4, 4.8),
  f('egg-white', 'Yumurta akı', '1 adet', 17, 3.6, 0.2, 0.1),
  f('whey', 'Whey protein tozu', '1 ölçek (30 g)', 120, 24, 3, 1.5),
  // Süt ürünleri
  f('milk', 'Süt (yarım yağlı)', '200 ml', 100, 6.8, 9.6, 3.2),
  f('yogurt', 'Yoğurt (tam yağlı)', '100 g', 61, 3.5, 4.7, 3.3),
  f('greek-yogurt', 'Süzme yoğurt (%0 yağ)', '100 g', 59, 10, 3.6, 0.4),
  f('ayran', 'Ayran', '200 ml', 60, 3.5, 4.5, 2.5),
  f('cottage', 'Lor peyniri', '100 g', 98, 11, 3.4, 4.3),
  f('feta', 'Beyaz peynir', '30 g', 80, 4.2, 0.9, 6.3),
  f('kashar', 'Kaşar peyniri', '30 g', 105, 7, 0.3, 8.5),
  // Karbonhidratlar
  f('rice', 'Pirinç pilavı (pişmiş)', '100 g', 130, 2.7, 28, 0.3),
  f('pasta', 'Makarna (pişmiş)', '100 g', 158, 5.8, 31, 0.9),
  f('bulgur', 'Bulgur pilavı (pişmiş)', '100 g', 83, 3.1, 18.6, 0.2),
  f('oats', 'Yulaf ezmesi (kuru)', '50 g', 195, 8.5, 33, 3.5),
  f('bread-wh', 'Tam buğday ekmeği', '1 dilim (30 g)', 75, 3.5, 13, 1),
  f('bread', 'Beyaz ekmek', '1 dilim (30 g)', 80, 2.6, 15, 1),
  f('simit', 'Simit', '1 adet', 330, 10, 60, 6),
  f('potato', 'Patates (haşlanmış)', '100 g', 87, 1.9, 20, 0.1),
  f('sweet-potato', 'Tatlı patates (fırın)', '100 g', 90, 2, 21, 0.2),
  // Baklagiller
  f('chickpea', 'Nohut (haşlanmış)', '100 g', 164, 8.9, 27, 2.6),
  f('red-lentil', 'Kırmızı mercimek (pişmiş)', '100 g', 116, 9, 20, 0.4),
  f('white-bean', 'Kuru fasulye (pişmiş)', '100 g', 127, 8.7, 22.8, 0.5),
  f('lentil-soup', 'Mercimek çorbası', '1 kase (250 ml)', 150, 8, 22, 3),
  // Meyve & sebze
  f('banana', 'Muz', '1 orta', 105, 1.3, 27, 0.4),
  f('apple', 'Elma', '1 orta', 95, 0.5, 25, 0.3),
  f('orange', 'Portakal', '1 orta', 62, 1.2, 15, 0.2),
  f('strawberry', 'Çilek', '100 g', 32, 0.7, 7.7, 0.3),
  f('broccoli', 'Brokoli (pişmiş)', '100 g', 35, 2.4, 7.2, 0.4),
  f('tomato', 'Domates', '100 g', 18, 0.9, 3.9, 0.2),
  f('cucumber', 'Salatalık', '100 g', 15, 0.7, 3.6, 0.1),
  f('avocado', 'Avokado', '100 g', 160, 2, 8.5, 14.7),
  // Yağlar & kuruyemiş
  f('olive-oil', 'Zeytinyağı', '1 yemek kaşığı', 119, 0, 0, 13.5),
  f('peanut-butter', 'Fıstık ezmesi', '1 yemek kaşığı', 94, 4, 3.2, 8),
  f('almond', 'Badem', '30 g', 173, 6.3, 6.5, 15),
  f('walnut', 'Ceviz', '30 g', 196, 4.6, 4.1, 19.6),
  f('hazelnut', 'Fındık', '30 g', 188, 4.5, 5, 18),
  f('honey', 'Bal', '1 tatlı kaşığı', 21, 0, 5.7, 0),
  // Hazır / sık yenenler
  f('menemen', 'Menemen', '1 porsiyon', 250, 12, 8, 18),
  f('lahmacun', 'Lahmacun', '1 adet', 270, 12, 35, 9),
];
