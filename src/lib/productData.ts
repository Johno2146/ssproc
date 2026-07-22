// Product specification data extracted from PDF spec sheets
export interface ProductSpec {
  material?: string;
  pullStrength?: string;
  dimensions?: string;
  boxSize?: string;
  boxWeight?: string;
  colours: string[];
  applications?: string[];
  features?: string[];
  securityLevel?: string;
  printing?: string[];
  weightKg?: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
}

export interface PackDimensions {
  weightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
}

export interface QuantityTier {
  label: string;
  unit: string;
  price: number;
  shipping?: PackDimensions;
}

export interface ProductOption {
  size: string;
  price: number;
  unit: string;
  minOrder: number;
  boxSize?: string;
  boxWeight?: string;
}

export const productSpecs: Record<string, ProductSpec> = {
  'suretite-320mm': {
    material: 'High quality polypropylene',
    pullStrength: '49 kg',
    dimensions: 'Flag: 22mm x 51mm, Length: 310mm x 7mm',
    colours: ['White', 'Black', 'Red', 'Purple', 'Light Blue', 'Dark Blue', 'Orange', 'Brown', 'Light Green', 'Dark Green', 'Yellow', 'Pink', 'Grey'],
    applications: ['Gates', 'Drums', 'Bags', 'Tankers', 'Doors', 'Boxes', 'Trucks'],
    features: ['Security Level - High', 'Entry only possible through correct side of locking chamber', 'Available with teeth prongs for sealing of bags'],
    securityLevel: 'High',
    printing: ['Unique sequential numbers', 'Barcode', 'QR Code', 'Company Logo (Optional)'],
    boxSize: '500mm x 410mm x 310mm',
    boxWeight: '5.0 kgs',
    weightKg: 0.01,
    lengthCm: 32,
    widthCm: 1,
    heightCm: 0.7,
  },
  'suretite-230mm': {
    material: 'High quality polypropylene',
    pullStrength: '49 kg',
    dimensions: 'Flag: 22mm x 51mm, Length: 230mm x 8mm',
    colours: ['White', 'Black', 'Red', 'Purple', 'Light Blue', 'Dark Blue', 'Orange', 'Brown', 'Light Green', 'Dark Green', 'Yellow', 'Pink', 'Grey'],
    applications: ['Gates', 'Drums', 'Bags', 'Tankers', 'Doors', 'Boxes', 'Trucks'],
    features: ['Security Level - High', 'Entry only possible through correct side of locking chamber', 'Available with teeth prongs for sealing of bags'],
    securityLevel: 'High',
    printing: ['Unique sequential numbers', 'Barcode', 'QR Code', 'Company Logo (Optional)'],
    boxSize: '500mm x 310mm x 310mm',
    boxWeight: '4.5 kgs',
    weightKg: 0.009,
    lengthCm: 23,
    widthCm: 1,
    heightCm: 0.8,
  },
  'suretite-barcoded': {
    material: 'High quality polypropylene',
    pullStrength: '49 kg',
    dimensions: 'Flag: 22mm x 51mm, Length: 310mm x 7mm',
    colours: ['White', 'Black', 'Red', 'Purple', 'Light Blue', 'Dark Blue', 'Orange', 'Brown', 'Light Green', 'Dark Green', 'Yellow', 'Pink', 'Grey'],
    applications: ['Gates', 'Drums', 'Bags', 'Tankers', 'Doors', 'Boxes', 'Trucks'],
    features: ['Security Level - High', 'Entry only possible through correct side of locking chamber', 'Pre-barcoded for tracking'],
    securityLevel: 'High',
    printing: ['Unique sequential numbers', 'Barcode (pre-printed)', 'QR Code', 'Company Logo (Optional)'],
    boxSize: '500mm x 410mm x 310mm',
    boxWeight: '5.0 kgs',
    weightKg: 0.01,
    lengthCm: 32,
    widthCm: 1,
    heightCm: 0.7,
  },
  'twinlock': {
    material: 'High quality polypropylene',
    pullStrength: '49 kg',
    dimensions: 'Flag: 22mm x 43mm, Length: 400mm x 6.6mm x 2mm',
    colours: ['White', 'Black', 'Red', 'Purple', 'Light Blue', 'Dark Blue', 'Orange', 'Brown', 'Light Green', 'Dark Green', 'Yellow', 'Pink', 'Grey'],
    applications: ['Gates', 'Drums', 'Bags', 'Tankers', 'Doors', 'Boxes', 'Trucks'],
    features: ['Double-locking mechanism', 'Entry only possible through correct side of locking chamber', 'Available with teeth prongs for sealing of bags'],
    securityLevel: 'High',
    printing: ['Unique sequential numbers', 'Barcode', 'QR Code', 'Company Logo (Optional)'],
    boxSize: '450mm x 450mm x 340mm',
    boxWeight: '5.5 kgs',
    weightKg: 0.011,
    lengthCm: 40,
    widthCm: 0.66,
    heightCm: 0.2,
  },
  'twinlock-barcoded': {
    material: 'High quality polypropylene',
    pullStrength: '49 kg',
    dimensions: 'Flag: 22mm x 43mm, Length: 400mm x 6.6mm x 2mm',
    colours: ['White', 'Black', 'Red', 'Purple', 'Light Blue', 'Dark Blue', 'Orange', 'Brown', 'Light Green', 'Dark Green', 'Yellow', 'Pink', 'Grey'],
    applications: ['Gates', 'Drums', 'Bags', 'Tankers', 'Doors', 'Boxes', 'Trucks'],
    features: ['Double-locking mechanism', 'Pre-barcoded for tracking', 'Entry only possible through correct side of locking chamber'],
    securityLevel: 'High',
    printing: ['Unique sequential numbers', 'Barcode (pre-printed)', 'QR Code', 'Company Logo (Optional)'],
    boxSize: '450mm x 450mm x 340mm',
    boxWeight: '5.5 kgs',
    weightKg: 0.011,
    lengthCm: 40,
    widthCm: 0.66,
    heightCm: 0.2,
  },
  'padlock-seal': {
    material: 'High quality polypropylene with stainless steel wire',
    dimensions: 'Length: 37mm, Width: 21mm',
    colours: ['White', 'Black', 'Red', 'Purple', 'Light Blue', 'Dark Blue', 'Orange', 'Brown', 'Light Green', 'Dark Green', 'Yellow', 'Pink', 'Grey'],
    applications: ['Trolleys', 'Cash Containers', 'Cages', 'Tankers', 'Shipping Containers', 'Vehicles', 'Trucks', 'Warehouses', 'Gates'],
    features: ['Security Level - High', 'Plastic body seal with metal hasp for tamper evidence', 'If tampered with, a wire pierces through the plastic body'],
    securityLevel: 'High',
    printing: ['Unique sequential numbers', 'Barcode', 'Company Logo (Optional)'],
    boxSize: '390mm x 250mm x 190mm',
    boxWeight: '4.5 kgs',
    weightKg: 0.025,
    lengthCm: 4,
    widthCm: 2.5,
    heightCm: 1.5,
  },
  'nylock-seal': {
    material: 'Nylon 6',
    pullStrength: '15 kg',
    dimensions: 'Flag: 24mm x 55mm, Tail Diameter: 3mm, Total Length: 310mm',
    colours: ['White', 'Black', 'Red', 'Purple', 'Light Blue', 'Orange', 'Brown', 'Dark Green', 'Yellow'],
    applications: ['Fire Doors', 'First Aid Boxes', 'Fire Hydrants', 'Battle Boxes'],
    features: ['Security Level - Medium', 'Entry only possible through correct side of locking chamber'],
    securityLevel: 'Medium',
    printing: ['Unique sequential numbers', 'Barcode', 'Company Logo (Optional)'],
    boxSize: '290mm x 160mm x 320mm',
    boxWeight: '2.3 kgs',
    weightKg: 0.008,
    lengthCm: 31,
    widthCm: 0.5,
    heightCm: 0.3,
  },
  'suregas-seal': {
    material: 'High quality polypropylene',
    dimensions: 'Flag: 28mm x 30mm, Length: 270mm x 6mm',
    colours: ['Various Colours - contact for availability'],
    applications: ['Gas Bottles', 'Cylinder Security'],
    features: ['Security Level - High', 'Entry only possible through correct side of locking chamber', 'Large flag for clear identification'],
    securityLevel: 'High',
    printing: ['Unique sequential numbers', 'Barcode', 'QR Code'],
    boxSize: '430mm x 360mm x 310mm',
    boxWeight: '4.3 kgs',
    weightKg: 0.009,
    lengthCm: 27,
    widthCm: 0.6,
    heightCm: 0.6,
  },
  'cable-lock-500mm': {
    material: 'Mild Steel',
    dimensions: 'Length: 500mm',
    colours: ['Standard'],
    applications: ['Logistics', 'Shipping', 'Industrial'],
    features: ['High-security cable lock', 'Mild steel construction'],
    securityLevel: 'High',
    boxSize: 'Bulk packaging',
    boxWeight: 'Variable',
    weightKg: 0.15,
    lengthCm: 50,
    widthCm: 2,
    heightCm: 1,
  },
  'bolt-seal': {
    material: 'Metal',
    dimensions: 'Standard bolt seal size',
    colours: ['Standard'],
    applications: ['Shipping Containers', 'Heavy-duty Logistics', 'Transport'],
    features: ['ISO 17712 compliant', 'High-security bolt seal', 'Custom printing available'],
    securityLevel: 'High',
    printing: ['Custom printing available'],
    boxSize: 'Bulk packaging',
    boxWeight: 'Variable',
    weightKg: 0.08,
    lengthCm: 10,
    widthCm: 2,
    heightCm: 2,
  },
  'abs-cable-lock': {
    material: 'ABS Plastic',
    dimensions: '300mm',
    colours: ['Standard'],
    applications: ['Bags', 'Drums', 'Boxes', 'Light Industrial'],
    features: ['Lightweight and durable', 'Tamper-evident', 'Easy to apply'],
    securityLevel: 'High',
    printing: ['Custom printing available'],
    boxSize: 'Bulk packaging',
    boxWeight: 'Variable',
    weightKg: 0.05,
    lengthCm: 30,
    widthCm: 3,
    heightCm: 2,
  },
  'cable-seal-300mm': {
    material: 'Plastic coated steel cable',
    dimensions: '300mm',
    colours: ['Standard'],
    applications: ['Logistics', 'Shipping', 'Industrial', 'Warehouse'],
    features: ['Medium security cable seal', 'Flexible yet strong', 'Tamper-evident'],
    securityLevel: 'Medium',
    boxSize: 'Bulk packaging',
    boxWeight: 'Variable',
    weightKg: 0.04,
    lengthCm: 30,
    widthCm: 1.5,
    heightCm: 1.5,
  },
  'cable-seal-500mm': {
    material: 'Plastic coated steel cable',
    dimensions: '500mm',
    colours: ['Standard'],
    applications: ['Logistics', 'Shipping', 'Industrial', 'Heavy-duty'],
    features: ['High security cable seal', 'Heavy-duty construction', 'Tamper-evident'],
    securityLevel: 'High',
    boxSize: 'Bulk packaging',
    boxWeight: 'Variable',
    weightKg: 0.06,
    lengthCm: 50,
    widthCm: 1.5,
    heightCm: 1.5,
  },
};

export const quantityTiers: Record<string, QuantityTier[]> = {
  'suretite-320mm': [
    { label: 'Per 50', unit: '50 pack', price: 55.00, shipping: { weightKg: 0.300, lengthCm: 45, widthCm: 25, heightCm: 5 } },
    { label: 'Per 100', unit: '100 pack', price: 90.00, shipping: { weightKg: 0.500, lengthCm: 43, widthCm: 25, heightCm: 8 } },
    { label: 'Per 1000', unit: '1000 pack', price: 870.00, shipping: { weightKg: 5.0, lengthCm: 50, widthCm: 41, heightCm: 31 } },
  ],
  'suretite-230mm': [
    { label: 'Per 1000', unit: '1000 pack', price: 810.00, shipping: { weightKg: 4.5, lengthCm: 50, widthCm: 31, heightCm: 31 } },
  ],
  'twinlock': [
    { label: 'Per 50', unit: '50 pack', price: 60.00, shipping: { weightKg: 0.310, lengthCm: 45, widthCm: 23, heightCm: 6 } },
    { label: 'Per 100', unit: '100 pack', price: 100.00, shipping: { weightKg: 0.509, lengthCm: 45, widthCm: 23, heightCm: 10 } },
    { label: 'Per 1000', unit: '1000 pack', price: 870.00, shipping: { weightKg: 5.5, lengthCm: 45, widthCm: 45, heightCm: 34 } },
  ],
  'nylock-seal': [
    { label: 'Per 40', unit: '40 pack', price: 49.00, shipping: { weightKg: 0.130, lengthCm: 33.2, widthCm: 22, heightCm: 4 } },
    { label: 'Per 80', unit: '80 pack', price: 90.00, shipping: { weightKg: 0.244, lengthCm: 32, widthCm: 22, heightCm: 6 } },
    { label: 'Per 1000', unit: '1000 pack', price: 705.00, shipping: { weightKg: 2.3, lengthCm: 29, widthCm: 16, heightCm: 32 } },
  ],
  'bolt-seal': [
    { label: 'Per 12', unit: '12 pack', price: 105.00, shipping: { weightKg: 0.570, lengthCm: 28, widthCm: 13, heightCm: 4.2 } },
    { label: 'Per box of 240', unit: '240 pack', price: 1920.00, shipping: { weightKg: 13.8, lengthCm: 22, widthCm: 30, heightCm: 27 } },
  ],
  'padlock-seal': [
    { label: 'Per 50', unit: '50 pack', price: 89.00, shipping: { weightKg: 0.185, lengthCm: 13, widthCm: 18, heightCm: 4 } },
    { label: 'Per 100', unit: '100 pack', price: 159.00, shipping: { weightKg: 0.370, lengthCm: 20, widthCm: 18, heightCm: 4 } },
    { label: 'Per 1000', unit: '1000 pack', price: 1420.00, shipping: { weightKg: 4.5, lengthCm: 39, widthCm: 25, heightCm: 19 } },
  ],
  'abs-cable-lock': [
    { label: 'Per 20', unit: '20 pack', price: 199.00, shipping: { weightKg: 0.294, lengthCm: 42, widthCm: 15, heightCm: 4.5 } },
    { label: 'Per 50', unit: '50 pack', price: 450.00, shipping: { weightKg: 0.808, lengthCm: 42, widthCm: 22, heightCm: 5 } },
    { label: 'Per 250', unit: '250 pack', price: 1625.00, shipping: { weightKg: 4.05, lengthCm: 45, widthCm: 23, heightCm: 10 } },
    { label: 'Per 1000', unit: '1000 pack', price: 6000.00, shipping: { weightKg: 15.4, lengthCm: 42, widthCm: 29, heightCm: 15 } },
  ],
  'cable-seal-300mm': [
    { label: 'Per 20', unit: '20 pack', price: 225.00, shipping: { weightKg: 0.260, lengthCm: 39, widthCm: 14, heightCm: 4 } },
    { label: 'Per 50', unit: '50 pack', price: 480.00, shipping: { weightKg: 0.756, lengthCm: 39, widthCm: 17, heightCm: 6 } },
    { label: 'Per 250', unit: '250 pack', price: 2125.00, shipping: { weightKg: 3.222, lengthCm: 45, widthCm: 20, heightCm: 10 } },
    { label: 'Per 1000', unit: '1000 pack', price: 8000.00, shipping: { weightKg: 9.2, lengthCm: 30, widthCm: 24, heightCm: 21 } },
  ],
  'cable-seal-500mm': [
    { label: 'Per 20', unit: '20 pack', price: 250.00, shipping: { weightKg: 0.294, lengthCm: 62, widthCm: 19, heightCm: 6 } },
    { label: 'Per 50', unit: '50 pack', price: 510.00, shipping: { weightKg: 0.778, lengthCm: 62, widthCm: 14, heightCm: 4 } },
    { label: 'Per 250', unit: '250 pack', price: 2250.00, shipping: { weightKg: 3.540, lengthCm: 64, widthCm: 25, heightCm: 12 } },
    { label: 'Per 1000', unit: '1000 pack', price: 8500.00, shipping: { weightKg: 9.2, lengthCm: 30, widthCm: 24, heightCm: 21 } },
  ],
};

export const colourHexMap: Record<string, string> = {
  'White': '#ffffff',
  'Black': '#000000',
  'Red': '#dc2626',
  'Purple': '#9333ea',
  'Light Blue': '#60a5fa',
  'Dark Blue': '#1e40af',
  'Orange': '#f97316',
  'Brown': '#92400e',
  'Light Green': '#86efac',
  'Dark Green': '#166534',
  'Yellow': '#eab308',
  'Pink': '#ec4899',
  'Grey': '#6b7280',
};

// Tier-specific colour restrictions for certain products
// Per 50 and Per 100: only White, Yellow, Light Blue
// Per 1000: all colours
const limitedColours = ['White', 'Yellow', 'Light Blue'];

export const tierColours: Record<string, Record<string, string[]>> = {
  'suretite-320mm': {
    'Per 50': limitedColours,
    'Per 100': limitedColours,
    'Per 1000': productSpecs['suretite-320mm']?.colours || limitedColours,
  },
  'twinlock': {
    'Per 50': limitedColours,
    'Per 100': limitedColours,
    'Per 1000': productSpecs['twinlock']?.colours || limitedColours,
  },
  'nylock-seal': {
    'Per 40': limitedColours,
    'Per 80': limitedColours,
    'Per 1000': productSpecs['nylock-seal']?.colours || limitedColours,
  },
}
  'ct-black-100mm': { material: 'PA66 (Nylon 6/6)', pullStrength: 'N/A', dimensions: '100 × 2.5 × 1.1 mm', colours: ['Black'], applications: ['Cable management', 'General purpose'], features: ['UV resistant'], securityLevel: 'Standard', boxSize: '45 × 30 × 30 cm', boxWeight: '7.5 kg/carton', weightKg: 0.01, lengthCm: 10, widthCm: 10, heightCm: 4 },
  'ct-colour-100mm': { material: 'PA66 (Nylon 6/6)', pullStrength: 'N/A', dimensions: '100 × 2.5 × 1.1 mm', colours: ['Black, White, Red, Blue, Green, Yellow, Orange, Purple, Pink, Brown, Navy, Lime, Silver'], applications: ['Cable management', 'General purpose'], features: ['UV resistant'], securityLevel: 'Standard', boxSize: '45 × 30 × 30 cm', boxWeight: '7.5 kg/carton', weightKg: 0.01, lengthCm: 10, widthCm: 10, heightCm: 4 },
  'ct-black-150mm': { material: 'PA66 (Nylon 6/6)', pullStrength: 'N/A', dimensions: '150 × 3.6 × 1.3 mm', colours: ['Black'], applications: ['Cable management', 'General purpose'], features: ['UV resistant'], securityLevel: 'Standard', boxSize: '45 × 30 × 30 cm', boxWeight: '8.5 kg/carton', weightKg: 0.01, lengthCm: 10, widthCm: 10, heightCm: 4 },
  'ct-colour-150mm': { material: 'PA66 (Nylon 6/6)', pullStrength: 'N/A', dimensions: '150 × 3.6 × 1.3 mm', colours: ['Black, White, Red, Blue, Green, Yellow, Orange, Purple, Pink, Brown, Navy, Lime, Silver'], applications: ['Cable management', 'General purpose'], features: ['UV resistant'], securityLevel: 'Standard', boxSize: '45 × 30 × 30 cm', boxWeight: '8.5 kg/carton', weightKg: 0.01, lengthCm: 10, widthCm: 10, heightCm: 4 },
  'ct-black-200mm': { material: 'PA66 (Nylon 6/6)', pullStrength: 'N/A', dimensions: '200 × 4.8 × 1.3 mm', colours: ['Black'], applications: ['Cable management', 'General purpose'], features: ['UV resistant'], securityLevel: 'Standard', boxSize: '45 × 30 × 30 cm', boxWeight: '10 kg/carton', weightKg: 0.01, lengthCm: 10, widthCm: 10, heightCm: 4 },
  'ct-colour-200mm': { material: 'PA66 (Nylon 6/6)', pullStrength: 'N/A', dimensions: '200 × 4.8 × 1.3 mm', colours: ['Black, White, Red, Blue, Green, Yellow, Orange, Purple, Pink, Brown, Navy, Lime, Silver'], applications: ['Cable management', 'General purpose'], features: ['UV resistant'], securityLevel: 'Standard', boxSize: '45 × 30 × 30 cm', boxWeight: '10 kg/carton', weightKg: 0.01, lengthCm: 10, widthCm: 10, heightCm: 4 },
  'ct-black-slim-200mm': { material: 'PA66 (Nylon 6/6)', pullStrength: 'N/A', dimensions: '200 × 3.6 × 1.1 mm', colours: ['Black'], applications: ['Cable management', 'General purpose'], features: ['UV resistant'], securityLevel: 'Standard', boxSize: '45 × 30 × 30 cm', boxWeight: '8.5 kg/carton', weightKg: 0.01, lengthCm: 10, widthCm: 10, heightCm: 4 },
  'ct-colour-slim-200mm': { material: 'PA66 (Nylon 6/6)', pullStrength: 'N/A', dimensions: '200 × 3.6 × 1.1 mm', colours: ['Black, White, Red, Blue, Green, Yellow, Orange, Purple, Pink, Brown, Navy, Lime, Silver'], applications: ['Cable management', 'General purpose'], features: ['UV resistant'], securityLevel: 'Standard', boxSize: '45 × 30 × 30 cm', boxWeight: '8.5 kg/carton', weightKg: 0.01, lengthCm: 10, widthCm: 10, heightCm: 4 },
  'ct-heavy-duty-black-200mm': { material: 'PA66 (Nylon 6/6)', pullStrength: 'N/A', dimensions: '200 × 7.6 × 1.9 mm', colours: ['Black'], applications: ['Cable management', 'General purpose'], features: ['UV resistant'], securityLevel: 'Medium', boxSize: '58 × 30 × 33 cm', boxWeight: '12 kg/carton', weightKg: 0.01, lengthCm: 10, widthCm: 10, heightCm: 4 },
  'ct-heavy-duty-colour-200mm': { material: 'PA66 (Nylon 6/6)', pullStrength: 'N/A', dimensions: '200 × 7.6 × 1.9 mm', colours: ['Black, White, Red, Blue, Green, Yellow, Orange, Purple, Pink, Brown, Navy, Lime, Silver'], applications: ['Cable management', 'General purpose'], features: ['UV resistant'], securityLevel: 'Medium', boxSize: '58 × 30 × 33 cm', boxWeight: '12 kg/carton', weightKg: 0.01, lengthCm: 10, widthCm: 10, heightCm: 4 },
  'ct-black-300mm': { material: 'PA66 (Nylon 6/6)', pullStrength: 'N/A', dimensions: '300 × 4.8 × 1.3 mm', colours: ['Black'], applications: ['Cable management', 'General purpose'], features: ['UV resistant'], securityLevel: 'Standard', boxSize: '45 × 30 × 30 cm', boxWeight: '11 kg/carton', weightKg: 0.01, lengthCm: 10, widthCm: 10, heightCm: 4 },
  'ct-colour-300mm': { material: 'PA66 (Nylon 6/6)', pullStrength: 'N/A', dimensions: '300 × 4.8 × 1.3 mm', colours: ['Black, White, Red, Blue, Green, Yellow, Orange, Purple, Pink, Brown, Navy, Lime, Silver'], applications: ['Cable management', 'General purpose'], features: ['UV resistant'], securityLevel: 'Standard', boxSize: '45 × 30 × 30 cm', boxWeight: '11 kg/carton', weightKg: 0.01, lengthCm: 10, widthCm: 10, heightCm: 4 },
  'ct-heavy-duty-black-300mm': { material: 'PA66 (Nylon 6/6)', pullStrength: 'N/A', dimensions: '300 × 7.6 × 1.9 mm', colours: ['Black'], applications: ['Cable management', 'General purpose'], features: ['UV resistant'], securityLevel: 'Medium', boxSize: '58 × 30 × 33 cm', boxWeight: '13 kg/carton', weightKg: 0.01, lengthCm: 10, widthCm: 10, heightCm: 4 },
  'ct-heavy-duty-colour-300mm': { material: 'PA66 (Nylon 6/6)', pullStrength: 'N/A', dimensions: '300 × 7.6 × 1.9 mm', colours: ['Black, White, Red, Blue, Green, Yellow, Orange, Purple, Pink, Brown, Navy, Lime, Silver'], applications: ['Cable management', 'General purpose'], features: ['UV resistant'], securityLevel: 'Medium', boxSize: '58 × 30 × 33 cm', boxWeight: '13 kg/carton', weightKg: 0.01, lengthCm: 10, widthCm: 10, heightCm: 4 },
  'ct-black-400mm': { material: 'PA66 (Nylon 6/6)', pullStrength: 'N/A', dimensions: '400 × 4.8 × 1.3 mm', colours: ['Black'], applications: ['Cable management', 'General purpose'], features: ['UV resistant'], securityLevel: 'Standard', boxSize: '45 × 30 × 30 cm', boxWeight: '12 kg/carton', weightKg: 0.01, lengthCm: 10, widthCm: 10, heightCm: 4 },
  'ct-colour-400mm': { material: 'PA66 (Nylon 6/6)', pullStrength: 'N/A', dimensions: '400 × 4.8 × 1.3 mm', colours: ['Black, White, Red, Blue, Green, Yellow, Orange, Purple, Pink, Brown, Navy, Lime, Silver'], applications: ['Cable management', 'General purpose'], features: ['UV resistant'], securityLevel: 'Standard', boxSize: '45 × 30 × 30 cm', boxWeight: '12 kg/carton', weightKg: 0.01, lengthCm: 10, widthCm: 10, heightCm: 4 },
  'ct-heavy-duty-black-400mm': { material: 'PA66 (Nylon 6/6)', pullStrength: 'N/A', dimensions: '400 × 7.6 × 1.9 mm', colours: ['Black'], applications: ['Cable management', 'General purpose'], features: ['UV resistant'], securityLevel: 'Medium', boxSize: '58 × 30 × 33 cm', boxWeight: '14 kg/carton', weightKg: 0.01, lengthCm: 10, widthCm: 10, heightCm: 4 },
  'ct-heavy-duty-colour-400mm': { material: 'PA66 (Nylon 6/6)', pullStrength: 'N/A', dimensions: '400 × 7.6 × 1.9 mm', colours: ['Black, White, Red, Blue, Green, Yellow, Orange, Purple, Pink, Brown, Navy, Lime, Silver'], applications: ['Cable management', 'General purpose'], features: ['UV resistant'], securityLevel: 'Medium', boxSize: '58 × 30 × 33 cm', boxWeight: '14 kg/carton', weightKg: 0.01, lengthCm: 10, widthCm: 10, heightCm: 4 },
  'ct-heavy-duty-black-500mm': { material: 'PA66 (Nylon 6/6)', pullStrength: 'N/A', dimensions: '500 × 7.6 × 1.9 mm', colours: ['Black'], applications: ['Cable management', 'General purpose'], features: ['UV resistant'], securityLevel: 'Medium', boxSize: '58 × 30 × 33 cm', boxWeight: '15 kg/carton', weightKg: 0.01, lengthCm: 10, widthCm: 10, heightCm: 4 },
  'ct-heavy-duty-colour-500mm': { material: 'PA66 (Nylon 6/6)', pullStrength: 'N/A', dimensions: '500 × 7.6 × 1.9 mm', colours: ['Black, White, Red, Blue, Green, Yellow, Orange, Purple, Pink, Brown, Navy, Lime, Silver'], applications: ['Cable management', 'General purpose'], features: ['UV resistant'], securityLevel: 'Medium', boxSize: '58 × 30 × 33 cm', boxWeight: '15 kg/carton', weightKg: 0.01, lengthCm: 10, widthCm: 10, heightCm: 4 },
  'ct-extra-heavy-duty-black-540mm': { material: 'PA66 (Nylon 6/6)', pullStrength: 'N/A', dimensions: '540 × 13 × 2.3 mm', colours: ['Black'], applications: ['Cable management', 'General purpose'], features: ['UV resistant'], securityLevel: 'High', boxSize: '58 × 30 × 33 cm', boxWeight: '18.5 kg/carton', weightKg: 0.01, lengthCm: 10, widthCm: 10, heightCm: 4 },
  'ct-extra-heavy-duty-colour-540mm': { material: 'PA66 (Nylon 6/6)', pullStrength: 'N/A', dimensions: '540 × 13 × 2.3 mm', colours: ['Black, White, Red, Blue, Green, Yellow, Orange, Purple, Pink, Brown, Navy, Lime, Silver'], applications: ['Cable management', 'General purpose'], features: ['UV resistant'], securityLevel: 'High', boxSize: '58 × 30 × 33 cm', boxWeight: '18.5 kg/carton', weightKg: 0.01, lengthCm: 10, widthCm: 10, heightCm: 4 },

;