-- ========================================
-- SCRIPT COMPLETO: CATEGORIAS, ATRIBUTOS E MATERIAIS
-- ========================================

-- 1. INSERTAR CATEGORIAS (se não existirem)
INSERT INTO `categoria` (`nome`) VALUES
('Climatização'),
('Tintas'),
('Ferramentas'),
('Materiais de Construção'),
('Acabamentos');

-- 2. ADICIONAR ATRIBUTOS POR CATEGORIA

-- Climatização
INSERT INTO `atributos_categoria` (`id_categoria`, `nome`, `tipo`) VALUES
(1, 'BTU', 'range'),
(1, 'Marca', 'select'),
(1, 'Tipo', 'select');

-- Tintas
INSERT INTO `atributos_categoria` (`id_categoria`, `nome`, `tipo`) VALUES
(2, 'Cor', 'select'),
(2, 'Acabamento', 'select'),
(2, 'Marca', 'select');

-- Ferramentas
INSERT INTO `atributos_categoria` (`id_categoria`, `nome`, `tipo`) VALUES
(3, 'Potência', 'range'),
(3, 'Tipo', 'select'),
(3, 'Marca', 'select');

-- Materiais de Construção
INSERT INTO `atributos_categoria` (`id_categoria`, `nome`, `tipo`) VALUES
(4, 'Dimensão', 'select'),
(4, 'Material', 'select'),
(4, 'Marca', 'select');

-- Acabamentos
INSERT INTO `atributos_categoria` (`id_categoria`, `nome`, `tipo`) VALUES
(5, 'Tipo', 'select'),
(5, 'Cor', 'select'),
(5, 'Marca', 'select');

-- 3. ADICIONAR VALORES DOS ATRIBUTOS

-- Climatização - Marca (ID atributo: 2)
INSERT INTO `valores_atributos` (`id_atributo`, `valor`) VALUES
(2, 'Daikin'),
(2, 'LG'),
(2, 'Samsung'),
(2, 'Fujitsu'),
(2, 'Midea');

-- Climatização - Tipo (ID atributo: 3)
INSERT INTO `valores_atributos` (`id_atributo`, `valor`) VALUES
(3, 'Split'),
(3, 'Janela'),
(3, 'Portátil');

-- Tintas - Cor (ID atributo: 5)
INSERT INTO `valores_atributos` (`id_atributo`, `valor`) VALUES
(5, 'Branco'),
(5, 'Preto'),
(5, 'Cinzento'),
(5, 'Azul'),
(5, 'Vermelho'),
(5, 'Verde');

-- Tintas - Acabamento (ID atributo: 6)
INSERT INTO `valores_atributos` (`id_atributo`, `valor`) VALUES
(6, 'Mate'),
(6, 'Brilho'),
(6, 'Seda');

-- Tintas - Marca (ID atributo: 7)
INSERT INTO `valores_atributos` (`id_atributo`, `valor`) VALUES
(7, 'Coral'),
(7, 'Caparol'),
(7, 'Suvinil'),
(7, 'Dulux');

-- Ferramentas - Tipo (ID atributo: 9)
INSERT INTO `valores_atributos` (`id_atributo`, `valor`) VALUES
(9, 'Furadeira'),
(9, 'Mó Angular'),
(9, 'Serra Circular'),
(9, 'Martelo Perfurador'),
(9, 'Chave Elétrica');

-- Ferramentas - Marca (ID atributo: 10)
INSERT INTO `valores_atributos` (`id_atributo`, `valor`) VALUES
(10, 'DeWalt'),
(10, 'Makita'),
(10, 'Bosch'),
(10, 'Metabo'),
(10, 'Festool');

-- Materiais de Construção - Dimensão (ID atributo: 12)
INSERT INTO `valores_atributos` (`id_atributo`, `valor`) VALUES
(12, '20x20'),
(12, '30x30'),
(12, '40x40'),
(12, '50x50');

-- Materiais de Construção - Material (ID atributo: 13)
INSERT INTO `valores_atributos` (`id_atributo`, `valor`) VALUES
(13, 'Cerâmica'),
(13, 'Porcelana'),
(13, 'Pedra Natural'),
(13, 'Madeira');

-- Materiais de Construção - Marca (ID atributo: 14)
INSERT INTO `valores_atributos` (`id_atributo`, `valor`) VALUES
(14, 'Roca'),
(14, 'Portinari'),
(14, 'Cerâmica São Caetano');

-- Acabamentos - Tipo (ID atributo: 16)
INSERT INTO `valores_atributos` (`id_atributo`, `valor`) VALUES
(16, 'Moldura'),
(16, 'Rodapé'),
(16, 'Cornija'),
(16, 'Batente');

-- Acabamentos - Cor (ID atributo: 17)
INSERT INTO `valores_atributos` (`id_atributo`, `valor`) VALUES
(17, 'Branco'),
(17, 'Carvalho'),
(17, 'Wengué'),
(17, 'Mogno');

-- Acabamentos - Marca (ID atributo: 18)
INSERT INTO `valores_atributos` (`id_atributo`, `valor`) VALUES
(18, 'Pauma'),
(18, 'Eucafloor'),
(18, 'Tarkett');

-- 4. INSERTAR MATERIAIS POR CATEGORIA

-- CLIMATIZAÇÃO (Categoria 1)
INSERT INTO `material` (`nome`, `descricao`, `preco`, `stock`, `imagem`, `id_categoria`, `id_tipo_preco`) VALUES
('Ar Condicionado Daikin 12000 BTU', 'Ar condicionado Split Daikin com eficiência energética A++', '899.99', 15, 'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=400&auto=format&fit=crop', 1, 1),
('Ar Condicionado LG 18000 BTU', 'Ar condicionado Split LG com tecnologia Smart', '1299.99', 8, 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&auto=format&fit=crop', 1, 1),
('Ar Condicionado Portátil Samsung', 'Ar condicionado portátil com rodas', '599.99', 12, 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&auto=format&fit=crop', 1, 1),
('Ar Condicionado Janela Fujitsu', 'Ar condicionado de janela compacto e eficiente', '449.99', 20, 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&auto=format&fit=crop', 1, 1),
('Ar Condicionado Midea 9000 BTU', 'Ar condicionado básico com boa relação preço-qualidade', '549.99', 25, 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&auto=format&fit=crop', 1, 1);

-- TINTAS (Categoria 2)
INSERT INTO `material` (`nome`, `descricao`, `preco`, `stock`, `imagem`, `id_categoria`, `id_tipo_preco`) VALUES
('Tinta Branca Coral Premium 18L', 'Tinta acrílica de alta qualidade acabamento mate', '75.50', 50, 'https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=400&auto=format&fit=crop', 2, 1),
('Tinta Azul Caparol 15L', 'Tinta de qualidade profissional com acabamento brilho', '89.99', 30, 'https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=400&auto=format&fit=crop', 2, 1),
('Tinta Cinzenta Suvinil 18L', 'Tinta resistente com acabamento seda', '65.00', 45, 'https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=400&auto=format&fit=crop', 2, 1),
('Tinta Vermelha Dulux 15L', 'Tinta premium para interiores e exteriores', '95.50', 20, 'https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=400&auto=format&fit=crop', 2, 1),
('Tinta Verde Coral 18L', 'Tinta acrílica com excelente cobertura', '78.00', 35, 'https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=400&auto=format&fit=crop', 2, 1);

-- FERRAMENTAS (Categoria 3)
INSERT INTO `material` (`nome`, `descricao`, `preco`, `stock`, `imagem`, `id_categoria`, `id_tipo_preco`) VALUES
('Furadeira DeWalt 500W', 'Furadeira profissional com velocidade variável', '125.00', 18, 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&auto=format&fit=crop', 3, 1),
('Mó Angular Makita 125mm', 'Mó angular poderosa para corte e desbaste', '89.99', 25, 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&auto=format&fit=crop', 3, 1),
('Serra Circular Bosch 1200W', 'Serra circular profissional com laser de corte', '149.99', 12, 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&auto=format&fit=crop', 3, 1),
('Martelo Perfurador Metabo 800W', 'Martelo perfurador para trabalhos pesados', '179.99', 8, 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&auto=format&fit=crop', 3, 1),
('Chave Elétrica Festool 12V', 'Chave elétrica compacta e leve', '99.50', 20, 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&auto=format&fit=crop', 3, 1);

-- MATERIAIS DE CONSTRUÇÃO (Categoria 4)
INSERT INTO `material` (`nome`, `descricao`, `preco`, `stock`, `imagem`, `id_categoria`, `id_tipo_preco`) VALUES
('Azulejo Cerâmico Roca 20x20', 'Azulejo cerâmico para parede acabamento mate', '12.50', 100, 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&auto=format&fit=crop', 4, 2),
('Porcelana Portinari 30x30', 'Porcelana de alta durabilidade para piso', '18.75', 80, 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&auto=format&fit=crop', 4, 2),
('Pedra Natural São Caetano 40x40', 'Pedra natural premium para acabamentos', '35.00', 40, 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&auto=format&fit=crop', 4, 2),
('Madeira Maciça Carvalho', 'Madeira maciça de qualidade para mobiliário', '45.99', 60, 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&auto=format&fit=crop', 4, 1),
('Gesso Durável Premium 40kg', 'Gesso de alta qualidade para acabamentos internos', '8.50', 150, 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&auto=format&fit=crop', 4, 1);

-- ACABAMENTOS (Categoria 5)
INSERT INTO `material` (`nome`, `descricao`, `preco`, `stock`, `imagem`, `id_categoria`, `id_tipo_preco`) VALUES
('Moldura Branca Pauma 80mm', 'Moldura decorativa em PVC acabamento branco', '5.50', 120, 'https://images.unsplash.com/photo-1563095046-7bc0b00b7879?w=400&auto=format&fit=crop', 5, 1),
('Rodapé Carvalho Eucafloor 100mm', 'Rodapé em madeira maciça acabamento carvalho', '8.75', 90, 'https://images.unsplash.com/photo-1563095046-7bc0b00b7879?w=400&auto=format&fit=crop', 5, 1),
('Cornija Wengué Tarkett 60mm', 'Cornija em MDF acabamento wengué', '6.99', 75, 'https://images.unsplash.com/photo-1563095046-7bc0b00b7879?w=400&auto=format&fit=crop', 5, 1),
('Batente Mogno Pauma 80x30', 'Batente de madeira maciça acabamento mogno', '12.50', 60, 'https://images.unsplash.com/photo-1563095046-7bc0b00b7879?w=400&auto=format&fit=crop', 5, 1),
('Arandela Branca Cromada 200mm', 'Arandela decorativa em PVC com acabamento cromado', '22.00', 40, 'https://images.unsplash.com/photo-1563095046-7bc0b00b7879?w=400&auto=format&fit=crop', 5, 1);

-- ========================================
-- PRONTO! A base de dados foi populada com:
-- - 5 Categorias
-- - 15 Atributos
-- - 45 Valores de Atributos
-- - 25 Materiais (5 por categoria)
-- ========================================
