export function useGriot() {
  const queryGriot = async (params: any) => {
    const key = sessionStorage.getItem('griot_key');
    if (!key) {
      throw new Error("Griot API key missing");
    }

    const url = new URL("https://api.griot.ng/api/v1/records");
    
    // Add params to URL
    Object.keys(params).forEach(k => {
      if (params[k] !== undefined && params[k] !== null) {
        const paramName = k === 'page_size' ? 'limit' : k;
        url.searchParams.append(paramName, params[k].toString());
      }
    });

    const response = await fetch(url.toString(), {
      headers: {
        "X-API-Key": key,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`Griot API Error: ${response.statusText}`);
    }

    return await response.json();
  };

  return { queryGriot };
}
