import React from 'react';
import CpuGpuSimulator from './CpuGpuSimulator';
import NeuralNetPlayground from './NeuralNetPlayground';
import GradientDescentVisualizer from './GradientDescentVisualizer';
import TokenEmbeddingExplorer from './TokenEmbeddingExplorer';
import AttentionMapVisualizer from './AttentionMapVisualizer';
import RagSearchSimulator from './RagSearchSimulator';

export default function AiSimulationRenderer({ lesson }) {
  if (!lesson || lesson.track !== 'ai') return null;

  const { id, simulationType } = lesson;

  // Render specific interactive simulation based on simulationType or lesson.id
  if (simulationType === 'cpu_gpu' || ['ai-23', 'ai-24', 'ai-27', 'ai-30'].includes(id)) {
    return <CpuGpuSimulator />;
  }

  if (simulationType === 'neural_net' || ['ai-40', 'ai-48', 'ai-49', 'ai-50'].includes(id)) {
    return <NeuralNetPlayground />;
  }

  if (simulationType === 'gradient_descent' || ['ai-38', 'ai-39'].includes(id)) {
    return <GradientDescentVisualizer />;
  }

  if (simulationType === 'token_embedding' || ['ai-53', 'ai-54', 'ai-60'].includes(id)) {
    return <TokenEmbeddingExplorer />;
  }

  if (simulationType === 'attention' || ['ai-55', 'ai-56'].includes(id)) {
    return <AttentionMapVisualizer />;
  }

  if (simulationType === 'rag_search' || ['ai-78', 'ai-79'].includes(id)) {
    return <RagSearchSimulator />;
  }

  // Generic fallback interactive simulation chooser based on chapter
  if (lesson.chapter === 3) return <CpuGpuSimulator />;
  if (lesson.chapter === 4) return <GradientDescentVisualizer />;
  if (lesson.chapter === 5) return <NeuralNetPlayground />;
  if (lesson.chapter === 6) return <TokenEmbeddingExplorer />;

  return null;
}
