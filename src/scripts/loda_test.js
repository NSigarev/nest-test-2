import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 100, // Количество виртуальных пользователей
  duration: '5s', // Длительность теста
};

export default function () {
  let res = http.post('http://localhost:3000/articles/search');
  // let res = http.get('http://localhost:3000/articles');
  check(res, { 'status is 201': (r) => r.status === 201 });
  sleep(0.3);
}
