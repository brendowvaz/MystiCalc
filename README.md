# MystiCalc

Aplicativo Expo/React Native contendo somente a calculadora do projeto Magic Dice.

## Executar

```bash
npm install
npm start
```

Para abrir diretamente no navegador:

```bash
npm run web
```

O projeto não contém imagens de dados, integração com S3, cópia de HTML nem modo de teste oculto.

## Bloqueio por orientação

Em aparelhos Android e iOS, o teclado é bloqueado automaticamente quando a tela fica voltada para
baixo e desbloqueado quando volta a ficar voltada para cima. A mudança precisa permanecer estável
por alguns instantes para que pequenos movimentos não acionem o bloqueio por engano.

Esse recurso utiliza o acelerômetro do aparelho e, por isso, deve ser testado em um dispositivo
físico.

Todas as teclas fornecem uma vibração leve ao serem pressionadas. Durante o bloqueio por orientação,
o toque continua produzindo a vibração, mas não executa a ação da tecla.
