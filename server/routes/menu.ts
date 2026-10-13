import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { memoryIngredients } from '../store.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export let specialtyPizzas = [
  {
    id: 'spec_1',
    name: 'Margherita Supreme',
    tagline: 'Fresh Fior Di Latte, San Marzano sauce, fresh torn basil',
    description: 'The timeless Neapolitan classic made with crushed San Marzano tomatoes, whole milk fior di latte mozzarella, cold-pressed olive oil, and sweet garden basil.',
    price: 14.99,
    base: 'Crispy Thin Crust',
    sauce: 'San Marzano Marinara',
    cheese: 'Fresh Fior Di Latte Mozzarella',
    veggies: ['Fresh Genovese Basil', 'Cherry Tomatoes'],
    image: '/src/assets/images/pizza_margherita_supreme_1791884208030.jpg',
    badge: 'Chef Favorite',
    isVeg: true,
  },
  {
    id: 'spec_2',
    name: 'Farmhouse Garden Feast',
    tagline: 'Crimini mushrooms, crisp peppers, sweet corn, red onions',
    description: 'A vibrant harvest of farm-fresh crimini mushrooms, crunchy tricolor bell peppers, sweet golden corn, and charred red onions over rich marinara and mozzarella.',
    price: 15.99,
    base: 'Classic Hand Tossed',
    sauce: 'San Marzano Marinara',
    cheese: 'Fresh Fior Di Latte Mozzarella',
    veggies: ['Crimini Sliced Mushrooms', 'Crisp Bell Peppers', 'Sweet Golden Corn', 'Caramelized Red Onions'],
    image: '/src/assets/images/pizza_farmhouse_veggie_1791884207868.jpg',
    badge: 'Popular',
    isVeg: true,
  },
  {
    id: 'spec_3',
    name: 'Wood-Fired Truffle & Mushroom',
    tagline: 'Creamy alfredo, whipped ricotta, crimini mushrooms, roasted garlic',
    description: 'Decadent slow-simmered garlic alfredo sauce topped with baby portobellos, dollops of whipped ricotta, roasted garlic confit, and cracked black pepper.',
    price: 17.50,
    base: 'Artisan Sourdough',
    sauce: 'Creamy Garlic Alfredo',
    cheese: 'Whipped Ricotta Dollops',
    veggies: ['Crimini Sliced Mushrooms', 'Roasted Garlic Confit', 'Fresh Genovese Basil'],
    image: '/src/assets/images/pizza_hero_woodfired_1791884206805.jpg',
    badge: 'Gourmet',
    isVeg: true,
  },
  {
    id: 'spec_4',
    name: 'Spicy Peri Peri Paneer & Peppers',
    tagline: 'Fiery peri peri sauce, pickled jalapeños, Spanish olives, cheddar',
    description: 'A bold kick of African bird’s eye chili sauce, melted aged cheddar, spicy pickled jalapeños, sweet onions, and briny black olives.',
    price: 16.50,
    base: 'Cheese Burst Crust',
    sauce: 'Spicy Peri Peri Sauce',
    cheese: 'Sharp Aged Cheddar',
    veggies: ['Pickled Jalapeños', 'Crisp Bell Peppers', 'Spanish Black Olives'],
    image: '/src/assets/images/pizza_farmhouse_veggie_1791884207868.jpg',
    badge: 'Spicy',
    isVeg: true,
  },
  {
    id: 'spec_5',
    name: 'Mediterranean Pesto & Olives',
    tagline: 'Genovese basil pesto, cherry tomatoes, olives, smoked gouda',
    description: 'Lush crushed basil pesto base layered with smoked gouda, sweet charred cherry tomatoes, Spanish black olives, and caramelized red onions.',
    price: 16.99,
    base: 'Artisan Sourdough',
    sauce: 'Fresh Basil Pesto',
    cheese: 'Smoked Gouda',
    veggies: ['Spanish Black Olives', 'Cherry Tomatoes', 'Caramelized Red Onions'],
    image: '/src/assets/images/pizza_margherita_supreme_1791884208030.jpg',
    badge: 'Artisan',
    isVeg: true,
  },
];

// GET /api/menu - returns all components and specialty pizzas
router.get('/', (req, res) => {
  const bases = memoryIngredients.filter((i) => i.category === 'base');
  const sauces = memoryIngredients.filter((i) => i.category === 'sauce');
  const cheeses = memoryIngredients.filter((i) => i.category === 'cheese');
  const veggies = memoryIngredients.filter((i) => i.category === 'veggie');

  res.json({
    bases,
    sauces,
    cheeses,
    veggies,
    specialtyPizzas,
  });
});

// POST /api/menu - Admin: Add a new specialty pizza
router.post('/', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { name, tagline, description, price, base, sauce, cheese, veggies, image, badge, isVeg } = req.body;
    if (!name || !price) {
      return res.status(400).json({ error: 'Pizza name and price are required' });
    }

    const newPizza = {
      id: 'spec_' + Date.now(),
      name: name.trim(),
      tagline: tagline || `${base || 'Classic'} with ${cheese || 'Cheese'}`,
      description: description || 'Artisan chef special crafted with stone-hearth wood-fire technique.',
      price: parseFloat(price),
      base: base || 'Classic Hand Tossed',
      sauce: sauce || 'San Marzano Marinara',
      cheese: cheese || 'Fresh Fior Di Latte Mozzarella',
      veggies: Array.isArray(veggies) ? veggies : [],
      image: image || '/src/assets/images/pizza_margherita_supreme_1791884208030.jpg',
      badge: badge || 'Chef Special',
      isVeg: isVeg !== undefined ? isVeg : true,
    };

    specialtyPizzas.push(newPizza);

    res.status(201).json({
      message: 'Pizza added successfully to menu',
      pizza: newPizza,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/menu/:id - Admin: Update an existing specialty pizza
router.put('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const pizzaIndex = specialtyPizzas.findIndex((p) => p.id === id);

    if (pizzaIndex === -1) {
      return res.status(404).json({ error: 'Specialty pizza not found' });
    }

    const current = specialtyPizzas[pizzaIndex];
    const { name, tagline, description, price, base, sauce, cheese, veggies, image, badge, isVeg } = req.body;

    const updatedPizza = {
      ...current,
      name: name !== undefined ? name.trim() : current.name,
      tagline: tagline !== undefined ? tagline : current.tagline,
      description: description !== undefined ? description : current.description,
      price: price !== undefined ? parseFloat(price) : current.price,
      base: base !== undefined ? base : current.base,
      sauce: sauce !== undefined ? sauce : current.sauce,
      cheese: cheese !== undefined ? cheese : current.cheese,
      veggies: veggies !== undefined ? (Array.isArray(veggies) ? veggies : []) : current.veggies,
      image: image !== undefined ? image : current.image,
      badge: badge !== undefined ? badge : current.badge,
      isVeg: isVeg !== undefined ? isVeg : current.isVeg,
    };

    specialtyPizzas[pizzaIndex] = updatedPizza;

    res.json({
      message: 'Pizza updated successfully',
      pizza: updatedPizza,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/menu/:id - Admin: Delete a specialty pizza
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const initialLen = specialtyPizzas.length;
    specialtyPizzas = specialtyPizzas.filter((p) => p.id !== id);

    if (specialtyPizzas.length === initialLen) {
      return res.status(404).json({ error: 'Pizza not found' });
    }

    res.json({ message: 'Pizza removed from menu successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/menu/upload-image - Admin: Persistent image upload
router.post('/upload-image', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { imageData, filename } = req.body;
    if (!imageData) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    // Process base64 image data
    const matches = imageData.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Invalid base64 image format. Supported formats: JPG, PNG, WEBP' });
    }

    const ext = matches[1].replace('jpeg', 'jpg');
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    if (buffer.length > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'Image exceeds maximum 5MB size limit' });
    }

    const cleanFilename = `menu_custom_${Date.now()}.${ext}`;
    const targetDir = path.resolve(__dirname, '../../src/assets/images');
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const targetPath = path.join(targetDir, cleanFilename);
    fs.writeFileSync(targetPath, buffer);

    const publicUrl = `/src/assets/images/${cleanFilename}`;
    res.json({
      message: 'Image uploaded successfully',
      imageUrl: publicUrl,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Image upload failed' });
  }
});

export default router;
