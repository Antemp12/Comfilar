-- Criar tabela de configurações do site
CREATE TABLE IF NOT EXISTS configuracoes_site (
  id INT AUTO_INCREMENT PRIMARY KEY,
  chave VARCHAR(100) NOT NULL UNIQUE,
  valor TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Inserir configurações padrão para as imagens de login
INSERT INTO configuracoes_site (chave, valor) 
VALUES 
  ('login_background_image', 'https://i.etsystatic.com/20800859/r/il/31ce6c/2784722638/il_570xN.2784722638_62jx.jpg'),
  ('admin_background_image', 'https://i.etsystatic.com/20800859/r/il/31ce6c/2784722638/il_570xN.2784722638_62jx.jpg'),
  ('funcionario_background_image', 'https://i.etsystatic.com/20800859/r/il/31ce6c/2784722638/il_570xN.2784722638_62jx.jpg')
ON DUPLICATE KEY UPDATE valor = valor;
