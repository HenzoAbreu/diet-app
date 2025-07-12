import dotenv from "dotenv";
import cors from "cors";
import app from "./app";
dotenv.config();

const PORT = process.env.PORT || 3000;
app.use(
  cors({
    credentials: true,
  }),
);

app.listen(PORT, () => {
  console.log(`SERVER http://localhost:3000`);
});
