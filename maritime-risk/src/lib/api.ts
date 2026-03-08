const API_BASE_URL = 'http://localhost:8000';

export async function getVesselRisk(vesselId: string) {
    try {
        const response = await fetch(`${API_BASE_URL}/vessel-risk/${vesselId}`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error('Error fetching vessel risk:', error);
        return null;
    }
}

export async function getVoyageRisk(vesselId: string, origin: string, destination: string) {
    try {
        const params = new URLSearchParams({
            vessel_id: vesselId,
            origin,
            destination
        });
        const response = await fetch(`${API_BASE_URL}/voyage-risk?${params.toString()}`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error('Error fetching voyage risk:', error);
        return null;
    }
}

export async function getVessels() {
    try {
        const response = await fetch(`${API_BASE_URL}/vessels`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error('Error fetching vessels:', error);
        return [];
    }
}

export async function addVessel(vesselData: any) {
    try {
        const response = await fetch(`${API_BASE_URL}/add-vessel`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(vesselData)
        });
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error('Error adding vessel:', error);
        return { error: 'Failed' };
    }
}
