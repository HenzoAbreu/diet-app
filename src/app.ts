import express from "express";
import foodRoutes from "./routes/foodRoutes";
import userRoutes from "./routes/userRoutes";
import { errorHandler } from "./middlewares/errorHandler";
import mealRoutes from "./routes/mealRoutes";
import authRoutes from "./routes/authRoutes";
import mealPlanRoutes from "./routes/mealPlanRoutes";
import patientRoutes from "./routes/patientRoutes";

const app = express();

app.use(express.json());
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/food", foodRoutes);
app.use("/meal", mealRoutes);
app.use("/meal-plan", mealPlanRoutes);
app.use("/patient", patientRoutes);
app.use(errorHandler);

export default app;
