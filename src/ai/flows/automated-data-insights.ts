'use server';
/**
 * @fileOverview An AI agent that analyzes sales and performance data to identify trends, anomalies, and business opportunities.
 *
 * - automatedDataInsights - A function that handles the data analysis process.
 * - AutomatedDataInsightsInput - The input type for the automatedDataInsights function.
 * - AutomatedDataInsightsOutput - The return type for the automatedDataInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutomatedDataInsightsInputSchema = z.object({
  salesDataJson:
    z.string().describe(
      'A JSON string representing sales data, e.g., [{\"date\": \"2023-01-01\", \"revenue\": 1000}, {\"date\": \"2023-01-02\", \"revenue\": 1200}].'
    ),
  performanceIndicatorsJson:
    z.string().describe(
      'A JSON string representing performance indicators, e.g., [{\"metric\": \"customer_satisfaction\", \"value\": \"8.5\"}, {\"metric\": \"website_traffic\", \"value\": \"5000\"}].'
    ),
});
export type AutomatedDataInsightsInput = z.infer<typeof AutomatedDataInsightsInputSchema>;

const AutomatedDataInsightsOutputSchema = z.object({
  summary: z.string().describe('A high-level summary of the data analysis.'),
  trends: z.array(z.string()).describe('A list of identified trends in the data.'),
  anomalies:
    z.array(z.string()).describe('A list of detected anomalies or unusual patterns in the data.'),
  opportunities:
    z.array(z.string()).describe('A list of potential business opportunities derived from the analysis.'),
});
export type AutomatedDataInsightsOutput = z.infer<typeof AutomatedDataInsightsOutputSchema>;

export async function automatedDataInsights(
  input: AutomatedDataInsightsInput
): Promise<AutomatedDataInsightsOutput> {
  return automatedDataInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'automatedDataInsightsPrompt',
  input: {schema: AutomatedDataInsightsInputSchema},
  output: {schema: AutomatedDataInsightsOutputSchema},
  prompt: `You are an expert business analyst and data scientist. Your task is to analyze provided sales data and performance indicators.

Identify key trends, flag any anomalies, and suggest potential business opportunities based on the data. Provide a concise summary of your findings.

Sales Data (JSON format):
{{{salesDataJson}}}

Performance Indicators (JSON format):
{{{performanceIndicatorsJson}}}`,
});

const automatedDataInsightsFlow = ai.defineFlow(
  {
    name: 'automatedDataInsightsFlow',
    inputSchema: AutomatedDataInsightsInputSchema,
    outputSchema: AutomatedDataInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
