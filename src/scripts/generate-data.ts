import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import { User } from '../user/entity/user.entity';
import { Article } from '../article/entity/article.entity';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
async function generateData() {
  dotenv.config();
  // return;
  // Создаём подключение к базе данных
  // @ts-ignore
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_ADMIN_LOGIN,
    password: process.env.DB_ADMIN_PASSWORD,
    database: process.env.DB_DATABASE_NAME,
    entities: [User, Article],
    synchronize: true, // Включаем синхронизацию (осторожно в production!)
  });

  await dataSource.initialize();

  // Очищаем таблицы (опционально)
  await dataSource.getRepository(Article).delete({});
  await dataSource.getRepository(User).delete({});

  // Создаём пользователей
  const users = [] as User[];
  for (let i = 0; i < 5; i++) {
    const user = new User();
    user.login = faker.internet.username();
    user.passwordHash = await bcrypt.hash(faker.internet.password(), 10);
    user.email = faker.internet.email();
    users.push(user);
  }
  console.log(users);
  await dataSource.getRepository(User).save(users);

  // Создаём статьи
  const articles = [] as Article[];
  for (let i = 0; i < 20; i++) {
    const article = new Article();
    article.title = faker.lorem.sentence();
    article.content = faker.lorem.paragraphs(3);
    article.tags = faker.helpers.arrayElements(
      ['NestJS', 'TypeScript', 'Backend', 'Frontend', 'Database'],
      faker.number.int({ min: 1, max: 3 }),
    );
    article.isPublic = faker.datatype.boolean();
    article.author = faker.helpers.arrayElement(users); // Связываем статью с рандомным пользователем
    articles.push(article);
  }
  await dataSource.getRepository(Article).save(articles);

  console.log('Database seeded successfully!');
  await dataSource.destroy();
}

generateData().catch((error) => console.error('Seeding failed:', error));
