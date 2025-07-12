import express from "express";
import foodRoutes from "./routes/foodRoutes";
import userRoutes from "./routes/userRoutes";
import { errorHandler } from "./middlewares/errorHandler";
import mealRoutes from "./routes/mealRoutes";
import authRoutes from "./routes/authRoutes";
import mealPlanRoutes from "./routes/mealPlanRoutes";
import patientRoutes from "./routes/patientRoutes";
import { authenticateToken } from "./middlewares/authMiddleware";

const app = express();

app.use(express.json());

// auth routes
app.use("/auth", authRoutes);

// all routes
app.use("/user", authenticateToken, userRoutes);
app.use("/food", authenticateToken, foodRoutes);
app.use("/meal", authenticateToken, mealRoutes);
app.use("/meal-plan", authenticateToken, mealPlanRoutes);
app.use("/patient", authenticateToken, patientRoutes);

// Global error handler
app.use(errorHandler);

export default app;
