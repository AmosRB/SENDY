import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'data/selectors-fixed.json');

export default function handler(req, res) {
  if (req.method === 'GET') {
    const content = fs.existsSync(filePath)
      ? JSON.parse(fs.readFileSync(filePath, 'utf8'))
      : {};
    res.status(200).json(content);
  } else if (req.method === 'POST') {
    fs.writeFileSync(filePath, JSON.stringify(req.body, null, 2), 'utf8');
    res.status(200).json({ status: 'ok' });
  } else {
    res.status(405).end();
  }
}
