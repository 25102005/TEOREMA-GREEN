import React, { useState } from "react";
import { evaluate, derivative } from "mathjs";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const App: React.FC = () => {
  const [caseType, setCaseType] = useState<"case1" | "case2">("case2");
  const [fieldP, setFieldP] = useState<string>(""); // Componente P(x, y)
  const [fieldQ, setFieldQ] = useState<string>(""); // Componente Q(x, y)
  const [curve1, setCurve1] = useState<string>(""); // Curva inferior
  const [curve2, setCurve2] = useState<string>(""); // Curva superior
  const [xMin, setXMin] = useState<number>(-2); // Límite inferior en x
  const [xMax, setXMax] = useState<number>(2); // Límite superior en x
  const [step] = useState<number>(0.01); // Paso estándar para mejor rendimiento
  const [result, setResult] = useState<string | null>(null); // Resultado
  const [integralExpression, setIntegralExpression] = useState<string>(""); // Integral con límites
  const [error, setError] = useState<string>(""); // Mensajes de error
  const [lastGraphData, setLastGraphData] = useState<{
    curve1: string;
    curve2: string;
    xMin: number;
    xMax: number;
  } | null>(null); 

  const calculateIntegral = () => {
    setError("");
    setResult(null);
    setIntegralExpression("");

    try {
      if (!curve1 || !curve2 || (caseType === "case1" && (!fieldP || !fieldQ))) {
        setError("Por favor, ingresa todas las funciones y límites.");
        return;
      }

      let integral = 0;

      for (let x = xMin; x <= xMax; x += step) {
        const yMin = evaluate(curve1, { x });
        const yMax = evaluate(curve2, { x });

        if (isNaN(yMin) || isNaN(yMax)) {
          setError(`Límites no válidos en x = ${x}`);
          return;
        }

        // Realiza integración sobre y
        for (let y = yMin; y <= yMax; y += step) {
          let value = 0;

          // Dependiendo del caso, calcula con P y Q o con la función única
          if (caseType === "case1") {
            const partialQ = evaluate(derivative(fieldQ, "x").toString(), { x, y });
            const partialP = evaluate(derivative(fieldP, "y").toString(), { x, y });
            value = partialQ - partialP;
          } else if (caseType === "case2") {
            value = evaluate(fieldQ, { x, y });
          }

          if (isNaN(value)) {
            setError(`Error al evaluar el integrando en (x=${x}, y=${y}).`);
            return;
          }
          integral += value * step * step; // Aumenta el área acumulada
        }
      }

      setResult(integral.toFixed(4)); // Redondea el resultado
      setIntegralExpression(
        caseType === "case1"
          ? `∫∫(∂Q/∂x - ∂P/∂y) dydx, x ∈ [${xMin}, ${xMax}], y ∈ [${curve1}, ${curve2}]`
          : `∫∫(${fieldQ}) dydx, x ∈ [${xMin}, ${xMax}], y ∈ [${curve1}, ${curve2}]`
      );

      // Guarda los datos actuales para conservar la gráfica
      setLastGraphData({
        curve1,
        curve2,
        xMin,
        xMax,
      });

      // Limpia los campos tras calcular el resultado
      if (caseType === "case1") {
        setFieldP("");
        setFieldQ("");
      } else {
        setFieldQ("");
      }
      setCurve1("");
      setCurve2("");
      setXMin(0);
      setXMax(1);
    } catch (err) {
      console.error("Error en el cálculo:", err);
      setError("Ocurrió un error durante el cálculo. Verifica tus funciones.");
    }
  };

  const generateChartData = () => {
    if (!lastGraphData) return null;

    const { curve1, curve2, xMin, xMax } = lastGraphData;
    const dataX = [];
    const dataYMin = [];
    const dataYMax = [];

    for (let x = xMin; x <= xMax + 1; x += 0.05) {
      dataX.push(x);
      dataYMin.push(evaluate(curve1, { x }));
      dataYMax.push(evaluate(curve2, { x }));
    }

    return {
      labels: dataX.map((x) => x.toFixed(2)),
      datasets: [
        {
          label: "Curva inferior (yMin)",
          data: dataYMin,
          borderColor: "#9998ff", 
          borderWidth: 2,
          pointRadius: 0,
        },
        {
          label: "Curva superior (yMax)",
          data: dataYMax,
          borderColor: "#18eaf9",
          borderWidth: 2,
          pointRadius: 0,
        },
      ],
    };
  };

  return (
    <div className="app-container">
      <div className="controls-container">
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: "#18eaf9" }}>COBOLES</h1>
        </div>
        <h1>Calculadora del Teorema de Green</h1>
        <div className="inputs-group">
          <label>
            Selecciona el caso:
            <select
              value={caseType}
              onChange={(e) => setCaseType(e.target.value as "case1" | "case2")}
            >
              <option value="case1">
                Caso 1: Límites definidos con P(x, y) y Q(x, y)
              </option>
              <option value="case2">
                Caso 2: Función única con límites funcionales
              </option>
            </select>
          </label>
          {caseType === "case1" && (
            <>
              <label>
                Componente P(x, y):
                <input
                  value={fieldP}
                  onChange={(e) => setFieldP(e.target.value)}
                  placeholder="Ej: y^2 + x^2"
                />
              </label>
              <label>
                Componente Q(x, y):
                <input
                  value={fieldQ}
                  onChange={(e) => setFieldQ(e.target.value)}
                  placeholder="Ej: x * y"
                />
              </label>
            </>
          )}
          {caseType === "case2" && (
            <label>
              Función a integrar:
              <input
                value={fieldQ}
                onChange={(e) => setFieldQ(e.target.value)}
                placeholder="Ej: 2"
              />
            </label>
          )}
          <label>
            Curva inferior (en y):
            <input
              value={curve1}
              onChange={(e) => setCurve1(e.target.value)}
              placeholder="Ej: x^2"
            />
          </label>
          <label>
            Curva superior (en y):
            <input
              value={curve2}
              onChange={(e) => setCurve2(e.target.value)}
              placeholder="Ej: x"
            />
          </label>
          <label>
            x Mínimo:
            <input
              type="number"
              value={xMin}
              onChange={(e) => setXMin(parseFloat(e.target.value))}
            />
          </label>
          <label>
            x Máximo:
            <input
              type="number"
              value={xMax}
              onChange={(e) => setXMax(parseFloat(e.target.value))}
            />
          </label>
        </div>
        <button onClick={calculateIntegral}>Calcular</button>
        <h2>Resultado:</h2>
        {error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : (
          <p>{result !== null ? result : "No hay resultado aún."}</p>
        )}
        {integralExpression && (
          <p>
            Integral: <strong>{integralExpression}</strong>
          </p>
        )}
      </div>
      <div className="chart-container">
        
        <h2>Gráfica de Límites</h2>
        {lastGraphData && generateChartData() && (
          <Line
            data={generateChartData()!}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: "top",
                  labels: {
                    color: "#C9D1D9",
                    font: {
                      size: 14,
                    },
                  },
                },
                title: {
                  display: true,
                  text: "Límites de Integración",
                  color: "#9998ff",
                  font: {
                    size: 16,
                  },
                },
              },
              scales: {
                x: {
                  ticks: {
                    color: "#C9D1D9",
                    font: {
                      size: 12,
                    },
                  },
                  grid: {
                    color: "#30363D",
                  },
                },
                y: {
                  ticks: {
                    color: "#C9D1D9",
                    font: {
                      size: 12,
                    },
                  },
                  grid: {
                    color: "#30363D",
                  },
                },
              },
            }}
          />
        )}
      </div>
    </div>
  );
};

export default App;
