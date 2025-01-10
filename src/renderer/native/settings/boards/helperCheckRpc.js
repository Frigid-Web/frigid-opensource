const isUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch (error) {
        throw new Error('Not a valid URL');
    }
};

export const checkRpc = async (url, chainName) => {
    try {
        // Step 1: Validate URL
        isUrl(url);

        // Step 2: Test if RPC is functional
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'web3_clientVersion',
                params: [],
                id: 1
            })
        });

        if (!response.ok) {
            throw new Error('RPC endpoint is not functional');
        }

        const result = await response.json();
        if (!result.result) {
            throw new Error('Invalid response from RPC endpoint');
        }

        console.log(`Client Version: ${result.result}`);

        // Step 3: Validate the chain ID
        const chainResponse = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'eth_chainId',
                params: [],
                id: 1
            })
        });

        const chainResult = await chainResponse.json();
        const chainId = parseInt(chainResult.result, 16); // Convert hex to decimal
        const chainIds = {
            ethereum: 1,
            binance: 56,
            avalanche: 43114,
            arbitrum: 42161,
            optimism: 10,
            fantom: 250,
            polygon: 137,
        };
        let expectedChainId = chainIds[chainName];
        
        if (chainId !== expectedChainId) {
            throw new Error(`RPC endpoint is not for the expected chain. Expected: ${expectedChainId}, Found: ${chainId}`);
        }

        console.log(`RPC is functional and for the correct chain (Chain ID: ${chainId})`);
        return true;
    } catch (error) {
        if(error.message == 'Failed to fetch'){
            alert('RPC endpoint is not functional');
        }
        else{
            alert(error.message);

        }
        return false;
    }
};
