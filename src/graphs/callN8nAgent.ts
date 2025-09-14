import axios from "axios";
// const FormData = require('form-data');
import FormData from 'form-data';

// let lastArrayParams: any[] = []; // Store the last received array parameters

interface AgentState {
  agentId: string;
  n8nEndpoint: string;
  schemaConfig: string[];
}

const agentState: AgentState = {
  agentId: '',
  n8nEndpoint: '',
  schemaConfig: [],
};


/**
 * Call API to n8n webhook
 */
async function callN8nAPI(inputText: string): Promise<string> {
  try {

    //palm add here

    if (!agentState.n8nEndpoint) {
      throw new Error("n8nEndpoint is not set in state");
    }

    const formData = new FormData();
    formData.append("action", "sendMessage");
    formData.append("chatInput", inputText);
    formData.append("sessionId", "2");

    const response = await axios({
      method: 'POST',
      // url: 'https://volk-n8n-hedyhdh4hyc3ctch.southeastasia-01.azurewebsites.net/webhook/5b76e154-7a25-4321-a4d5-20bea546a924/chat',
      url: agentState.n8nEndpoint,
      headers: {
        ...formData.getHeaders(),
        Accept: '*/*',
      },
      data: formData,
    });

    console.log("[callN8nAPI] response:", response.data);

    // reset data
    agentState.n8nEndpoint = '';
    agentState.schemaConfig = [];

    return response.data?.output ?? "n8n didn't reply to the message.";
  } catch (error) {
    console.error("[callN8nAPI] error:", error);
    return "Error occurred while connecting to n8n";
  }
}

/**
 * Call function to interact with n8n agent
 */
export async function callN8nAgent(finalMessages: any[], config: any): Promise<string> {
    console.log('--- User Input to n8n ---');
    console.log(finalMessages);

    const lastHumanMessage = [...finalMessages]
        .reverse()
        .find(msg => msg.constructor.name === "HumanMessage");

    const userInput = lastHumanMessage?.content?.[0]?.text ?? "No message";

    console.log('--- Extracted User Input ---');
    console.log(userInput);

    const n8nReply = await callN8nAPI(userInput);

    console.log('--- n8n Reply ---');
    console.log(n8nReply);

  return n8nReply;
}

/**
 * test received array params
 */

export function logArrayParams(params: any[] | any): void {
  if (Array.isArray(params)) {
    console.log('--- Received Array Params ---');
    params.forEach((item, index) => {
      console.log(`Item [${index}]:`, item);
    });
  } else if (params && typeof params === 'object') {
    console.log('--- Received Single Param ---');
    Object.entries(params).forEach(([key, value]) => {
      console.log(`Key: ${key}, Value:`, value);
    });
    if ('agent_id' in params) {
      agentState.agentId = params.agent_id;
    }
    if ('n8n_endpoint' in params) {
      agentState.n8nEndpoint = params.n8n_endpoint;
    }
    if ('schema_config' in params && Array.isArray(params.schema_config)) {
      agentState.schemaConfig = params.schema_config;
    }
  }
}

/**
 * get state for condition compare
 */

export function getAgentState(): AgentState {
  return agentState;
}

