import React, { useState, useEffect }from 'react';
import Map from '../components/Map';
import { getAllReadings } from '../services/apiService';


const Data = () => {

    const [allReadings, setAllReadings] = useState([]);

    useEffect(() => {
        const fetchAllReadings = async () => {
          try {
            const readings = await getAllReadings();
            const markers = readings.map((reading) => ({
                id: reading.id,
                lat: reading.lat,
                long: reading.long,
                popupContent: `<b>Dispositivo ${reading.deviceName} - sesión ${reading.session}</b> <br/> 
                    Fecha de lectura: ${reading.readingDate} <br/>
                    Elevación: ${reading.elevation} <br/>
                    Temperatura del agua: ${reading.waterTemp} <br/>
                    Temperatura del aire: ${reading.airTemp} <br/>
                    Húmedad del aire:  ${reading.airHumidity} <br/>
                    PH:  ${reading.ph} <br/>
                    ${reading.analogReading
                        ?(`
                            Lluvia en las últimas 24hrs:  ${reading.analogReading.rainPast24hrs} <br/>
                            Lugar de lectura:  ${reading.analogReading.readingPlace} <br/>
                            Escala Forel-Ule:  ${reading.analogReading.forelUleScale} <br/>
                            Disco Secchi:  ${reading.analogReading.secchiDepth} <br/>
                        `)
                        :"no tiene datos análogos"
                    } 
                `, 
              }));
              setAllReadings(markers);
          } catch (error) {
            console.error('Error fetching readings', error);
          }
        };
      
        fetchAllReadings();
      }, []);
      
    return (
    <div style={{ height: '500px' }}>
        <Map markers={allReadings} center={[15, -90.5]} zoom={9} />
    </div>    );
}

export default Data;