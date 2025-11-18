import React, { useState } from 'react';

// --- Scoring Logic ---
const calculateRoundScore = (bid, actual) => {
  const b = parseInt(bid) || 0;
  const a = parseInt(actual) || 0;

  if (actual === '') {
    return 0;
  }

  // Rule 2: If actual equals bid
  if (a === b) {
    return b * 10;
  }
  // Rule 1: If actual is more than bid (Overtricks)
  else if (a > b) {
    return (b * 10) + (a - b);
  }
  // Rule 3: If actual is less than bid (Set)
  else {
    return b * -10;
  }
};

// --- Initial State ---
const createInitialRounds = () => {
  const rounds = [];
  for (let i = 3; i <= 13; i++) {
    rounds.push({
      round: i,
      team1Bid: '',
      team1Actual: '',
      team2Bid: '',
      team2Actual: '',
    });
  }
  return rounds;
};

// --- Main App Component ---
function App() {
  const [rounds, setRounds] = useState(createInitialRounds());
  
  // CHANGED: Initialize with empty strings (No pre-fill)
  const [team1Name, setTeam1Name] = useState('');
  const [team2Name, setTeam2Name] = useState('');

  const handleInputChange = (roundNum, team, field, value) => {
    if (value === '') {
      updateRoundState(roundNum, team, field, value);
      return;
    }
    const numValue = parseInt(value, 10);

    // Constraints
    if (numValue > roundNum) return; 
    if (numValue < 0) return;

    updateRoundState(roundNum, team, field, value);
  };

  const updateRoundState = (roundNum, team, field, value) => {
    setRounds(prevRounds =>
      prevRounds.map(r => {
        if (r.round !== roundNum) return r;

        const updatedRound = { ...r };
        updatedRound[`${team}${field}`] = value;

        // Auto-fill logic for remaining tricks
        if (field === 'Actual') {
          const otherTeam = team === 'team1' ? 'team2' : 'team1';
          if (value === '') {
            updatedRound[`${otherTeam}Actual`] = '';
          } else {
            const remainder = roundNum - parseInt(value, 10);
            updatedRound[`${otherTeam}Actual`] = remainder;
          }
        }
        return updatedRound;
      })
    );
  };

  // --- Calculations ---
  let team1RunningTotal = 0;
  let team2RunningTotal = 0;

  const calculatedData = rounds.map(r => {
    const team1Score = calculateRoundScore(r.team1Bid, r.team1Actual);
    const team2Score = calculateRoundScore(r.team2Bid, r.team2Actual);

    if (r.team1Actual !== '') {
      team1RunningTotal += team1Score;
    }
    if (r.team2Actual !== '') {
      team2RunningTotal += team2Score;
    }

    const isRoundScored = r.team1Actual !== '' || r.team2Actual !== '';
    const currentDiff = team1RunningTotal - team2RunningTotal;

    return {
      ...r,
      team1Score,
      team2Score,
      team1RunningTotal,
      team2RunningTotal,
      isRoundScored,
      currentDiff,
    };
  });

  const finalTeam1Total = team1RunningTotal;
  const finalTeam2Total = team2RunningTotal;
  const difference = finalTeam1Total - finalTeam2Total;

  // Helper for display names (fallback if empty)
  const t1Display = team1Name || 'Team 1';
  const t2Display = team2Name || 'Team 2';

  // --- Render ---
  return (
    <div style={styles.appContainer}>
      {/* Thick Header Bar */}
      <div style={styles.headerBar}>
        <h1 style={styles.header}>Spades Scorecard</h1>
      </div>

      <div style={styles.container}>
        {/* Team Name Inputs */}
        <div style={styles.nameSetupContainer}>
          <div style={styles.nameInputGroup}>
            <label style={{...styles.label, color: '#8C1D40'}}>Maroon Team Name:</label>
            <input 
              style={styles.nameInput}
              type="text" 
              value={team1Name} 
              onChange={(e) => setTeam1Name(e.target.value)}
              placeholder="Enter Name..."
            />
          </div>
          <div style={styles.nameInputGroup}>
            <label style={{...styles.label, color: '#B08900'}}>Gold Team Name:</label>
            <input 
              style={styles.nameInput}
              type="text" 
              value={team2Name} 
              onChange={(e) => setTeam2Name(e.target.value)}
              placeholder="Enter Name..."
            />
          </div>
        </div>

        {/* FLEX CONTAINER to hold Table (Left) and Summary (Right) */}
        <div style={styles.contentLayout}>
          
          {/* LEFT COLUMN: The Table */}
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Rd</th>
                  {/* CHANGED: Use t1Display/t2Display so header isn't empty */}
                  <th colSpan="4" style={styles.thTeam1}>{t1Display}</th>
                  <th colSpan="4" style={styles.thTeam2}>{t2Display}</th>
                  <th style={styles.th}>Lead</th>
                </tr>
                <tr>
                  <th style={styles.thSub}></th>
                  {/* Team 1 */}
                  <th style={styles.thSub}>Bid</th>
                  <th style={styles.thSub}>Wins</th>
                  <th style={styles.thSub}>Pts</th>
                  <th style={styles.thSub}>Tot</th>
                  {/* Team 2 */}
                  <th style={styles.thSub}>Bid</th>
                  <th style={styles.thSub}>Wins</th>
                  <th style={styles.thSub}>Pts</th>
                  <th style={styles.thSub}>Tot</th>
                  {/* Lead */}
                  <th style={styles.thSub}></th>
                </tr>
              </thead>
              <tbody>
                {calculatedData.map(data => (
                  <tr key={data.round}>
                    <td style={styles.tdCenter}>{data.round}</td>
                    
                    {/* Team 1 */}
                    <td style={styles.td}>
                      <input
                        type="number"
                        min="0"
                        max={data.round}
                        style={styles.input}
                        value={data.team1Bid}
                        onChange={e => handleInputChange(data.round, 'team1', 'Bid', e.target.value)}
                      />
                    </td>
                    <td style={styles.td}>
                      <input
                        type="number"
                        min="0"
                        max={data.round}
                        style={styles.input}
                        value={data.team1Actual}
                        onChange={e => handleInputChange(data.round, 'team1', 'Actual', e.target.value)}
                      />
                    </td>
                    <td style={styles.tdCenter}>
                      {data.team1Actual !== '' ? data.team1Score : '-'}
                    </td>
                    <td style={styles.tdCenterBold}>
                      {data.isRoundScored ? data.team1RunningTotal : '-'}
                    </td>
                    
                    {/* Team 2 */}
                    <td style={styles.td}>
                      <input
                        type="number"
                        min="0"
                        max={data.round}
                        style={styles.input}
                        value={data.team2Bid}
                        onChange={e => handleInputChange(data.round, 'team2', 'Bid', e.target.value)}
                      />
                    </td>
                    <td style={styles.td}>
                      <input
                        type="number"
                        min="0"
                        max={data.round}
                        style={styles.input}
                        value={data.team2Actual}
                        onChange={e => handleInputChange(data.round, 'team2', 'Actual', e.target.value)}
                      />
                    </td>
                    <td style={styles.tdCenter}>
                      {data.team2Actual !== '' ? data.team2Score : '-'}
                    </td>
                    <td style={styles.tdCenterBold}>
                      {data.isRoundScored ? data.team2RunningTotal : '-'}
                    </td>

                    <td style={styles.tdCenter}>
                      {data.isRoundScored 
                        ? (data.currentDiff > 0 ? `+${data.currentDiff}` : data.currentDiff) 
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* RIGHT COLUMN: The Summary Box */}
          <div style={styles.summaryContainer}>
            <div style={styles.totalsBox}>
              <h3 style={styles.totalsHeader}>Score Summary</h3>
              <div style={styles.totalRow}>
                <span style={{ color: '#8C1D40', fontWeight: 'bold' }}>{t1Display}:</span>
                <span style={{ fontWeight: 'bold' }}>{finalTeam1Total}</span>
              </div>
              <div style={styles.totalRow}>
                <span style={{ color: '#B08900', fontWeight: 'bold' }}>{t2Display}:</span>
                <span style={{ fontWeight: 'bold' }}>{finalTeam2Total}</span>
              </div>
              <hr style={styles.hr} />
              <div style={styles.totalRow} data-testid="difference-summary">
                <span>Difference:</span>
                <strong>
                  {Math.abs(difference)} 
                </strong>
              </div>
              <div style={{textAlign: 'center', fontSize: '0.9em', marginTop: '5px', color: '#666'}}>
                {difference > 0 ? `${t1Display} Leads` : difference < 0 ? `${t2Display} Leads` : 'Tie Game'}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// --- Styles ---
const styles = {
  appContainer: {
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#F3F0EB', 
    minHeight: '100vh',
    color: '#333',
  },
  headerBar: {
    backgroundColor: '#2D2926', 
    padding: '15px 0',
    color: '#FAF9F6',
    textAlign: 'center',
    marginBottom: '20px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  },
  header: {
    margin: '0 auto',
    fontSize: '2.5em',
    fontFamily: 'Georgia, serif',
  },
  container: {
    padding: '0 20px 20px 20px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  nameSetupContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '40px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  nameInputGroup: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  label: {
    fontSize: '0.9em',
    fontWeight: 'bold',
    marginBottom: '5px',
  },
  nameInput: {
    padding: '8px',
    fontSize: '1em',
    borderRadius: '4px',
    border: '1px solid #ccc',
    width: '200px',
    backgroundColor: '#FFFFFF',
  },
  contentLayout: {
    display: 'flex',
    flexDirection: 'row',
    gap: '20px',
    alignItems: 'flex-start',
  },
  tableContainer: {
    flex: '3',
    overflowX: 'auto',
  },
  summaryContainer: {
    flex: '1',
    minWidth: '200px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    fontSize: '0.95em',
    backgroundColor: '#FFFFFF',
  },
  th: {
    border: '1px solid #dcdcdc',
    padding: '10px 4px',
    backgroundColor: '#2D2926', 
    color: 'white',
    textAlign: 'center',
  },
  thTeam1: {
    border: '1px solid #dcdcdc',
    padding: '10px',
    backgroundColor: '#8C1D40', 
    color: 'white',
  },
  thTeam2: {
    border: '1px solid #dcdcdc',
    padding: '10px',
    backgroundColor: '#FFC627', 
    color: 'black', 
  },
  thSub: {
    border: '1px solid #dcdcdc',
    padding: '6px 2px',
    backgroundColor: '#EAE8DE',
    fontWeight: 'normal',
    fontSize: '0.85em',
    textAlign: 'center',
    color: '#444',
  },
  td: {
    border: '1px solid #dcdcdc',
    padding: '4px',
  },
  tdCenter: {
    border: '1px solid #dcdcdc',
    padding: '8px 4px',
    textAlign: 'center',
  },
  tdCenterBold: {
    border: '1px solid #dcdcdc',
    padding: '8px 4px',
    textAlign: 'center',
    fontWeight: 'bold',
    backgroundColor: '#FAF9F6',
  },
  input: {
    width: '100%',
    padding: '6px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxSizing: 'border-box',
    textAlign: 'center',
    fontSize: '1em',
  },
  totalsBox: {
    padding: '20px',
    border: '1px solid #dcdcdc',
    borderRadius: '8px',
    backgroundColor: '#FFFFFF',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    position: 'sticky', 
    top: '20px', 
  },
  totalsHeader: {
    marginTop: '0',
    marginBottom: '15px',
    textAlign: 'center',
    fontSize: '1.3em',
    color: '#333',
    fontFamily: 'Georgia, serif',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '1.1em',
    padding: '6px 0',
  },
  hr: {
    border: 'none',
    borderTop: '1px solid #ddd',
    margin: '10px 0',
  },
};

export default App;