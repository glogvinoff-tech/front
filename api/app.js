const express = require('express');
const app = express();
const port = 3000;

// МИДЛВЭРЫ

// Middleware для парсинга JSON
app.use(express.json());

// Middleware для логирования запросов
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// "БАЗА ДАННЫХ" - массив товаров
let products = [
  { id: 1, name: 'Помидоры Черри', price: 250 },
  { id: 2, name: 'Огурцы тепличные', price: 180 },
  { id: 3, name: 'Яблоки Голден', price: 150 },
  { id: 4, name: 'Бананы', price: 120 },
  { id: 5, name: 'Картофель молодой', price: 90 }
];

// ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ
const generateId = () => {
  const maxId = products.length > 0
    ? Math.max(...products.map(p => p.id))
    : 0;
  return maxId + 1;
};

// МАРШРУТЫ

// 1. ГЛАВНАЯ СТРАНИЦА
app.get('/', (req, res) => {
  res.json({
    message: 'Добро пожаловать в API товаров!',
    endpoints: {
      getAllProducts: 'GET /products',
      getProductById: 'GET /products/:id',
      createProduct: 'POST /products',
      updateProduct: 'PATCH /products/:id',
      deleteProduct: 'DELETE /products/:id'
    }
  });
});

// 2. ПОЛУЧЕНИЕ ВСЕХ ТОВАРОВ
app.get('/products', (req, res) => {
  res.json({
    success: true,
    count: products.length,
    data: products
  });
});

// 3. ПОЛУЧЕНИЕ ТОВАРА ПО ID
app.get('/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const product = products.find(p => p.id === id);
  
  if (!product) {
    return res.status(404).json({
      success: false,
      message: `Товар с ID ${id} не найден`
    });
  }
  
  res.json({
    success: true,
    data: product
  });
});

// 4. СОЗДАНИЕ НОВОГО ТОВАРА
app.post('/products', (req, res) => {
  const { name, price } = req.body;
  
  // Валидация
  if (!name || !price) {
    return res.status(400).json({
      success: false,
      message: 'Поля "name" и "price" обязательны'
    });
  }
  
  if (typeof price !== 'number' || price <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Поле "price" должно быть положительным числом'
    });
  }
  
  const newProduct = {
    id: generateId(),
    name,
    price
  };
  
  products.push(newProduct);
  
  res.status(201).json({
    success: true,
    message: 'Товар успешно создан',
    data: newProduct
  });
});

// 5. ОБНОВЛЕНИЕ ТОВАРА
app.patch('/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { name, price } = req.body;
  
  const product = products.find(p => p.id === id);
  
  if (!product) {
    return res.status(404).json({
      success: false,
      message: `Товар с ID ${id} не найден`
    });
  }
  
  if (name !== undefined) product.name = name;
  if (price !== undefined) {
    if (typeof price !== 'number' || price <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Поле "price" должно быть положительным числом'
      });
    }
    product.price = price;
  }
  
  res.json({
    success: true,
    message: 'Товар успешно обновлен',
    data: product
  });
});

// 6. УДАЛЕНИЕ ТОВАРА
app.delete('/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const initialLength = products.length;
  
  products = products.filter(p => p.id !== id);
  
  if (products.length === initialLength) {
    return res.status(404).json({
      success: false,
      message: `Товар с ID ${id} не найден`
    });
  }
  
  res.json({
    success: true,
    message: `Товар с ID ${id} успешно удален`,
    remaining: products.length
  });
});

// ЗАПУСК СЕРВЕРА
app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
  console.log(`Доступные эндпоинты:`);
  console.log(`   GET  /             - Главная страница`);
  console.log(`   GET  /products     - Все товары (${products.length} шт.)`);
  console.log(`   GET  /products/:id - Товар по ID`);
  console.log(`   POST /products     - Создать товар`);
  console.log(`   PATCH /products/:id - Обновить товар`);
  console.log(`   DELETE /products/:id - Удалить товар`);
  console.log(`\nПример товаров в базе:`);
  products.forEach(p => {
    console.log(`   ID ${p.id}: ${p.name} - ${p.price} руб.`);
  });
});