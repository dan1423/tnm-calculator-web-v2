"use client";
import React, { useState, useEffect } from 'react';

export default function TNMCalculator() {
  const [diseaseSites, setDiseaseSites] = useState<any[]>([]);
  const [selectedDisease, setSelectedDisease] = useState('');
  const [stagingData, setStagingData] = useState<any[]>([]);
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>({});
  const [calculatedStage, setCalculatedStage] = useState('...');
  const [tnmClassification, setTnmClassification] = useState('');

  const BASE_URL = 'https://dan1423-001-site1.btempurl.com';

  useEffect(() => {
    fetch(`${BASE_URL}/tnmstaging/diseases`)
      .then(response => response.json())
      .then(data => setDiseaseSites(data))
      .catch(error => console.error('Error:', error));
  }, []);

  const handleDiseaseChange = (diseaseId: string) => {
    setSelectedDisease(diseaseId);
    setStagingData([]);
    setSelectedValues({});
    setCalculatedStage('...');
    setTnmClassification('');

    if (!diseaseId) return;

    fetch(`${BASE_URL}/tnmstaging/staging-data-items-v2/${diseaseId}/1`)
      .then(response => response.json())
      .then(data => setStagingData(data))
      .catch(error => console.error('Error:', error));
  };

  const handleValueChange = (columnName: string, validValue: string) => {
    const newValues = { ...selectedValues, [columnName]: validValue };
    setSelectedValues(newValues);
    calculateStage(newValues);
  };

  const calculateStage = (values: Record<string, string>) => {
    if (!selectedDisease) return;

    let url = `${BASE_URL}/tnmstaging/calculate?diseaseId=${selectedDisease}&stagingTypeId=1`;
    
    Object.entries(values).forEach(([key, value]) => {
      if (value) url += `&${key}=${value}`;
    });

    fetch(url)
      .then(response => response.text())
      .then(data => {
        if (data.includes('The given data does not a produce a stage')) {
          setCalculatedStage('Unable to stage for this combination');
        } else {
          setCalculatedStage(data);
        }
        
        const tnmParts: string[] = [];
        stagingData.forEach(item => {
          if (selectedValues[item.columnName]) {
            tnmParts.push(selectedValues[item.columnName]);
          }
        });
        setTnmClassification(tnmParts.join(' '));
      })
      .catch(error => console.error('Error:', error));
  };

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: '1fr 1fr', 
      height: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif' 
    }}>
      {/* Left Panel - Selection Dropdowns */}
      <div style={{ 
        background: 'white', 
        overflowY: 'auto', 
        borderRight: '1px solid #e5e7eb' 
      }}>
        {/* Disease Dropdown */}
        <div style={{ padding: '30px', borderBottom: '1px solid #e5e7eb' }}>
          <select
            value={selectedDisease}
            onChange={(e) => handleDiseaseChange(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '1em',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              background: 'white',
              cursor: 'pointer'
            }}
          >
            <option value="">Select Disease Site...</option>
            {diseaseSites.map((disease) => (
              <option key={disease.ajccDiseaseId} value={disease.ajccDiseaseId}>
                {disease.diseaseTitle}
              </option>
            ))}
          </select>
        </div>

        {/* Selection Panel - Dropdowns */}
        <div style={{ padding: '30px' }}>
          {stagingData.length === 0 ? (
            <div style={{ color: '#9ca3af', textAlign: 'center', padding: '40px 20px' }}>
              Select a disease site to begin
            </div>
          ) : (
            <>
              <h3 style={{ 
                marginBottom: '20px', 
                color: '#1f2937', 
                fontSize: '1.1em', 
                fontWeight: 600 
              }}>
                Select Values
              </h3>
              {stagingData.map((item, index) => (
                <div key={index} style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    color: '#4b5563', 
                    fontWeight: 500, 
                    fontSize: '0.9em' 
                  }}>
                    {item.columnTitle}
                  </label>
                  <select
                    value={selectedValues[item.columnName] || ''}
                    onChange={(e) => handleValueChange(item.columnName, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '0.95em',
                      background: 'white'
                    }}
                  >
                    <option value="">Select...</option>
                    {item.valueDescList?.map((option: any, idx: number) => (
                      <option key={idx} value={option.validValue}>
                        {option.validValue} - {option.descr}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Right Panel - Questions List and Results */}
      <div style={{ background: '#f8f9fa', overflowY: 'auto', padding: '30px' }}>
        {/* Questions List */}
        {stagingData.length > 0 && (
          <div style={{ 
            background: 'white', 
            border: '1px solid #e5e7eb', 
            borderRadius: '8px', 
            padding: '20px',
            marginBottom: '20px'
          }}>
            {stagingData.map((item, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  padding: '18px 0',
                  borderBottom: index < stagingData.length - 1 ? '1px solid #f3f4f6' : 'none'
                }}
              >
                <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
                  <span style={{ color: '#9ca3af', fontWeight: 600 }}>{index + 1}.</span>
                  <span style={{ color: '#6366f1', fontWeight: 500 }}>{item.columnTitle}</span>
                </div>
                <div style={{ textAlign: 'right', minWidth: '150px' }}>
                  {selectedValues[item.columnName] ? (
                    <>
                      <div style={{ color: '#6366f1', fontStyle: 'italic', fontSize: '0.9em', marginBottom: '4px' }}>
                        {selectedValues[item.columnName]}
                      </div>
                      <div style={{ color: '#6b7280', fontSize: '0.85em', lineHeight: '1.4' }}>
                        {item.valueDescList.find((v: any) => v.validValue === selectedValues[item.columnName])?.descr}
                      </div>
                    </>
                  ) : (
                    <div style={{ color: '#9ca3af', fontSize: '0.85em' }}>Not selected</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TNM Classification Card - Blue Gradient */}
        <div style={{ 
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          padding: '25px',
          marginBottom: '20px',
          color: 'white'
        }}>
          <div style={{ 
            fontSize: '0.9em',
            opacity: 0.9,
            marginBottom: '8px'
          }}>
            TNM Classification
          </div>
          <div style={{ 
            fontSize: '1.8em',
            fontWeight: 700
          }}>
            {tnmClassification || 'Select values...'}
          </div>
        </div>

        {/* Stage Group Card - Green Gradient */}
        <div style={{ 
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          padding: '25px',
          color: 'white'
        }}>
          <div style={{ 
            fontSize: '0.9em',
            opacity: 0.9,
            marginBottom: '8px'
          }}>
            AJCC Prognostic Stage Group
          </div>
          <div style={{ 
            fontSize: '1.8em',
            fontWeight: 700
          }}>
            {calculatedStage}
          </div>
        </div>
      </div>
    </div>
  );
}