import React from 'react';
import CpuGpuSimulator from './CpuGpuSimulator';
import NeuralNetPlayground from './NeuralNetPlayground';
import GradientDescentVisualizer from './GradientDescentVisualizer';
import TokenEmbeddingExplorer from './TokenEmbeddingExplorer';
import AttentionMapVisualizer from './AttentionMapVisualizer';
import RagSearchSimulator from './RagSearchSimulator';
import DecisionTreeClassifierSimulator from './DecisionTreeClassifierSimulator';
import CnnKernelVisualizer from './CnnKernelVisualizer';
import PromptInjectionGuardrailSimulator from './PromptInjectionGuardrailSimulator';
import PythonCodeSandbox from './PythonCodeSandbox';

export default function AiSimulationRenderer({ lesson }) {
  if (!lesson || lesson.track !== 'ai') return null;

  const { id, simulationType, codeLab } = lesson;

  let simulationComponent = null;

  // Map specific interactive visual simulation based on simulationType or lesson.id
  if (simulationType === 'cpu_gpu' || ['ai-23', 'ai-24', 'ai-27', 'ai-30'].includes(id)) {
    simulationComponent = <CpuGpuSimulator />;
  } else if (simulationType === 'neural_net' || ['ai-40', 'ai-48', 'ai-49', 'ai-50'].includes(id)) {
    simulationComponent = <NeuralNetPlayground />;
  } else if (simulationType === 'gradient_descent' || ['ai-38', 'ai-39'].includes(id)) {
    simulationComponent = <GradientDescentVisualizer />;
  } else if (simulationType === 'token_embedding' || ['ai-53', 'ai-54', 'ai-60'].includes(id)) {
    simulationComponent = <TokenEmbeddingExplorer />;
  } else if (simulationType === 'attention' || ['ai-55', 'ai-56'].includes(id)) {
    simulationComponent = <AttentionMapVisualizer />;
  } else if (simulationType === 'rag_search' || ['ai-78', 'ai-79'].includes(id)) {
    simulationComponent = <RagSearchSimulator />;
  } else if (simulationType === 'decision_tree' || ['ai-70', 'ai-72'].includes(id)) {
    simulationComponent = <DecisionTreeClassifierSimulator />;
  } else if (simulationType === 'cnn_kernel' || ['ai-73', 'ai-74'].includes(id)) {
    simulationComponent = <CnnKernelVisualizer />;
  } else if (simulationType === 'prompt_injection' || ['ai-84', 'ai-89'].includes(id)) {
    simulationComponent = <PromptInjectionGuardrailSimulator />;
  } else if (lesson.chapter === 3) {
    simulationComponent = <CpuGpuSimulator />;
  } else if (lesson.chapter === 4) {
    simulationComponent = <GradientDescentVisualizer />;
  } else if (lesson.chapter === 5) {
    simulationComponent = <NeuralNetPlayground />;
  } else if (lesson.chapter === 6) {
    simulationComponent = <TokenEmbeddingExplorer />;
  } else if (lesson.chapter === 7) {
    simulationComponent = <DecisionTreeClassifierSimulator />;
  } else if (lesson.chapter === 8) {
    simulationComponent = <RagSearchSimulator />;
  } else if (lesson.chapter === 9) {
    simulationComponent = <PromptInjectionGuardrailSimulator />;
  } else if (lesson.chapter === 10) {
    simulationComponent = <DecisionTreeClassifierSimulator />;
  }

  return (
    <div className="space-y-6">
      {/* Interactive Visual Simulation */}
      {simulationComponent}

      {/* Python Interactive Code Sandbox (if lesson contains codeLab) */}
      {codeLab && <PythonCodeSandbox codeLab={codeLab} />}
    </div>
  );
}
