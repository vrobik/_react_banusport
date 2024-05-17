import React, { useState, useEffect } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import {
  CCard, CCardBody, CCardHeader, CCol, CDataTable,
  CRow, CPagination, CCardImg, CCollapse, CButton,
  CButtonGroup, CSwitch, CToaster, CToast, CToastHeader,
  CToastBody, CModalHeader,
  CModalTitle, CModalBody, CModalFooter, CModal, CFormText,
  CInputGroup, CInputGroupPrepend, CInputGroupText, CInput
} from '@coreui/react'
import CryptoJS from 'crypto-js';
import {GoogleSpreadsheet} from 'google-spreadsheet';
// import info from "./info_no_secrets";

const Players = () => {
  let scoreTeam1 = 0;
  let scoreTeam2 = 0;
  let localHash = localStorage.getItem('pass');
  const history = useHistory();
  const [modal, setModal] = useState(false)
  const [details, setDetails] = useState([]);
  const [teams, setTeams] = useState([]);
  const [players, setPlayears] = useState([]);
  const [editMode, setEditMode] = useState([]);
  const [editPlayer, setEditPlayer] = useState({});
  const [playersRows, setPlayersRows] = useState([]);
  const [playersDataSheet, setPlayersDataSheet] = useState([]);
  const [perpage, setPerpage] = useState(20);
  const [toasts, setToasts] = useState([]);
  const {
    REACT_APP_GOOGLESHEET_ID,
    REACT_APP_CLIENT_EMAIL,
    REACT_APP_PRIVATE_KEY,
    REACT_APP_SHEET_ID,
    // REACT_APP_SHEET_ID_TEST
  } = process.env;
  const doc = new GoogleSpreadsheet(REACT_APP_GOOGLESHEET_ID);
  const readSpreadsheet = async () => {
    try {
      await doc.useServiceAccountAuth({
        client_email: REACT_APP_CLIENT_EMAIL,
        private_key: REACT_APP_PRIVATE_KEY,
      });
      await doc.loadInfo();
      const sheet = doc.sheetsById[REACT_APP_SHEET_ID];
      // const sheet = doc.sheetsById[REACT_APP_SHEET_ID_TEST];
      return await sheet.getRows();
    } catch (e) {
      console.error('Error: ', e);
    }
  };
  if(playersDataSheet.length === 0) {
    readSpreadsheet().then((rows) => {
      setPlayersRows(rows);
      setPlayersDataSheet( Object.keys(rows).map(( player, i ) => ({
          id: rows[player].phone,
          idRow: i,
          name: rows[player].name,
          phone: rows[player].phone,
          photo: rows[player].photo,
          note: rows[player].note,
          pozitiile: rows[player].pozitiile,
        })
        )
      );
    });
  }
  const queryPage = useLocation().search.match(/page=([0-9]+)/, '');
  const currentPage = Number(queryPage && queryPage[1] ? queryPage[1] : 1);
  const pages = Math.ceil(playersDataSheet.length / perpage);
  const [page, setPage] = useState(currentPage);

  // EVENTS
  const addToast = (type, content = "") => {
    setToasts([
      ...toasts,
      { position: 'top-right', autohide: type === 'errors' ? 3000 : 1000, closeButton: true, fade: true, type, content }
    ])
  }
  const toasters = (()=>{
    return toasts.reduce((toasters, toast) => {
      toasters[toast.position] = toasters[toast.position] || []
      toasters[toast.position].push(toast)
      return toasters
    }, {})
  })()
  const pageChange = newPage => {
    currentPage !== newPage && history.push(`/players?page=${newPage}`);
  }
  const togglePlayer = (id) => {
    if(players.length === 12 && !players.includes(id)) {
      addToast('full');
    }else {
      if (players.includes(id)) {
        setPlayears([...(players.filter(e => e !== id))]);
      } else {
        setPlayears([...players, id]);
      }
      addToast('change');
    }
  }
  const toggleDetails = (index) => {
    const position = details.indexOf(index)
    let newDetails = details.slice()
    if (position !== -1) {
      newDetails.splice(position, 1)
    } else {
      newDetails = [...details, index]
    }
    setDetails(newDetails)
  }
  const renderToast = (param) => {
    switch (param.type){
      case 'full':
        return `Maximul jucatorilor este 12`;
      case 'low':
        return `Minimul de jucatorilor este 12`;
      case 'noteams':
        return `Generaza echipele!`;
      case 'pass':
        return `Wrong Password!!!`;
      case 'change':
        return Object.keys(playersDataSheet).map(pl => {
          return (
            players.includes(playersDataSheet[pl].id) ? <p key={playersDataSheet[pl].id}><b>{`${playersDataSheet[pl].name}`}</b></p> : ``
          )
        });
      case 'errors':
        return Object.keys(param.content).map(pl => <p key={pl}><b style={{textTransform: "capitalize"}} >{`${pl}`}: </b> {`${param.content[pl]}`}</p>);
      default:
        break
    }
  }
  const createTeams = (myType) => {
    if( players.length < 12 ) {
      addToast('low');
    }else {
      let playersData = {};
      let team1 = [];
      let team2 = [];
      if( typeof myType === "undefined" || myType === 'position' ) {
        // console.log('BY POSITION');
        const atac = {1: [], 2: [], 3: [], 4: []};
        const mid = {1: [], 2: [], 3: [], 4: []};
        const def = {1: [], 2: [], 3: [], 4: []};
        const goal = {1: [], 2: [], 3: [], 4: []};
        playersDataSheet.forEach(player => {
          if (players.includes(player.id)) {
            playersData[player.id] = player;
            const poz = player.pozitiile.split('.');
            switch (poz[0]) {
              case '1':
                atac[1] = [...atac[1], player];
                break
              case '2':
                mid[1] = [...mid[1], player];
                break
              case '3':
                def[1] = [...def[1], player];
                break
              case '4':
                goal[1] = [...goal[1], player];
                break
              default:
                break
            }
            switch (poz[1]) {
              case '1':
                atac[2] = [...atac[2], player];
                break
              case '2':
                mid[2] = [...mid[2], player];
                break
              case '3':
                def[2] = [...def[2], player];
                break
              case '4':
                goal[2] = [...goal[2], player];
                break
              default:
                break
            }
            switch (poz[2]) {
              case '1':
                atac[3] = [...atac[3], player];
                break
              case '2':
                mid[3] = [...mid[3], player];
                break
              case '3':
                def[3] = [...def[3], player];
                break
              case '4':
                goal[3] = [...goal[3], player];
                break
              default:
                break
            }
            switch (poz[3]) {
              case '1':
                atac[4] = [...atac[4], player];
                break
              case '2':
                mid[4] = [...mid[4], player];
                break
              case '3':
                def[4] = [...def[4], player];
                break
              case '4':
                goal[4] = [...goal[4], player];
                break
              default:
                break
            }
          }
        })
        Object.keys(atac).map(at => atac[at].sort((e, s) => parseFloat(s.note) - parseFloat(e.note)));
        Object.keys(mid).map(at => mid[at].sort((e, s) => parseFloat(s.note) - parseFloat(e.note)));
        Object.keys(def).map(at => def[at].sort((e, s) => parseFloat(s.note) - parseFloat(e.note)));
        Object.keys(goal).map(at => goal[at].sort((e, s) => parseFloat(s.note) - parseFloat(e.note)));
        team1 = [...atac[1].filter((f, i) => i % 2 === 0), ...mid[1].filter((f, i) => i % 2 === 0), ...def[1].filter((f, i) => i % 2 === 0), ...goal[1].filter((f, i) => i % 2 === 0)]
        team2 = [...atac[1].filter((f, i) => i % 2 !== 0), ...mid[1].filter((f, i) => i % 2 !== 0), ...def[1].filter((f, i) => i % 2 !== 0), ...goal[1].filter((f, i) => i % 2 !== 0)]
        if (team1.length !== team2.length) {
          team2 = [...team2, team1.slice(-1).pop()]
          team1.pop()
        }
        // console.log('atac', atac);
        // console.log('mid', mid);
        // console.log('def', def);
        // console.log('goal', goal);
        // console.log('playersData', playersData);
        scoreTeam1 = 0;
        scoreTeam2 = 0;
      }else if(myType === 'top'){
        // console.log('BY TOP');
        playersDataSheet.forEach(player => {
          if (players.includes(player.id)) {
            playersData[player.id] = player;
          }
        })
        const playersRandom = Object.values(playersData).sort((a, b) => parseFloat(b.note) - parseFloat(a.note));
        // console.log('playersRandom', playersRandom);
        playersRandom.forEach( (a, i) => {
          if( i%2 ){
            team2 = [...team2, a];
          }else{
            team1 = [...team1, a];
          }
        })
      }else{
        // console.log('BY RANDOM');
        playersDataSheet.forEach(player => {
          if (players.includes(player.id)) {
            playersData[player.id] = player;
          }
        })
        const playersRandom = Object.values(playersData).sort(() => 0.5 - Math.random());
        // console.log('playersRandom', playersRandom);
        team1 = playersRandom.slice(0, 6);
        team2 = playersRandom.slice(6, 12);
      }
      setTeams([team1, team2]);
      // console.log('team1', team1);
      // console.log('team2', team2);
      setModal(true)
    }
  }
  const showTeams = () => {
    if( players.length < 12 || teams.length < 2 ) {
      addToast('noteams');
    }else {
      setModal(true)
    }
  }
  const getPositions = (pos)=>{
    switch (pos) {
      case '1': return 'Att'
      case '2': return 'Mid'
      case '3': return 'Def'
      case '4': return 'Gk'
      default: return 'N/A'
    }
  }
  const editPlayerData = async (payload) => {
    let changes = {};
    switch (payload.data.name){
      case 'note': changes.note = payload.data.value; break
      case 'phone': changes.phone = payload.data.value; break
      case 'pozitiile': changes.pozitiile = payload.data.value; break
      default: break
    }
    setEditPlayer({...editPlayer, ...changes})
  }
  const updatePlayerData = () => {
    const errors = {};
    if( editPlayer.note > 10 || editPlayer.note < 0 ) errors.nota = 'Nota jucatorului nu corespunde intervalului [0 ... 10]';
    if( editPlayer.phone.match(/^[0-9]*$/g) === null ) errors.telefon = 'Numarul de telefon al jucatorului poate fin doar din cifre';
    const pz = editPlayer.pozitiile.split('.');
    const uniq = pz.includes("1") && pz.includes("2") && pz.includes("3") && pz.includes("4");
    if( pz.length !== 4 || !uniq ) errors.pozitii = 'Pozitiile de joc nu corespund formatului "1.2.3.4"';
    if( Object.keys(errors).length ){
      addToast("errors", errors);
      return null
    }
    playersRows[editMode[0]].note = editPlayer.note;
    playersRows[editMode[0]].phone = editPlayer.phone;
    playersRows[editMode[0]].pozitiile = editPlayer.pozitiile;
    playersRows[editMode[0]].save();
    let cp = playersDataSheet.slice();
    cp[editMode[0]] = {
      ...cp[editMode[0]],
      note: editPlayer.note,
      phone: editPlayer.phone,
      pozitiile: editPlayer.pozitiile,
      id: editPlayer.phone,
      idRow: editMode[0]
    }
    // console.log('cp after', cp[editMode[0]]);
    setPlayersDataSheet(cp);
    setEditMode([]);
    setEditPlayer({});
  }
  const toggleEditMode = ( [editId] ) => {
    if( localHash !== null && CryptoJS.MD5(localHash).toString() === 'b43c25877cb11b88bcf6341b90fdccab' ){
      if( typeof editId !== "undefined" ){
        setEditMode([editId]);
        setEditPlayer(playersRows[editId]);
      }else{
        setEditMode([]);
        setEditPlayer({});
      }
    }else{
      let pass = prompt("Password:", "");
      if (pass !== null && CryptoJS.MD5(pass).toString() === 'b43c25877cb11b88bcf6341b90fdccab') {
        localStorage.setItem('pass', pass);
        if( typeof editId !== "undefined" ){
          setEditMode([editId]);
          setEditPlayer(playersRows[editId]);
        }else{
          setEditMode([]);
          setEditPlayer({});
        }
      }else{
        addToast('pass');
        return null
      }
    }
  }

  // EFFECTS
  useEffect(() => {
    currentPage !== page && setPage(currentPage)
  }, [currentPage, page, playersDataSheet])
  // useEffect(() => {
  //   console.log('playersDataSheet', playersDataSheet);
  // }, [playersDataSheet])
  // useEffect(() => {
  //   console.log('editPlayer:', editPlayer);
  // }, [editPlayer])

  return (
    <CRow>
      {(playersDataSheet.length) ?
      <CCol xl={12}>
        <CCard>
          <CCardHeader>
            <CRow className="align-items-center">
              <CCol col="6" sm="6" md="6" xl="6" className="mb-3 mb-xl-0">
                <CButtonGroup>
                  <CButton color="success" onClick={()=>addToast('change')} >Jucatori selectati</CButton>
                  <CButton color="danger" onClick={()=>setPlayears([])} >Reseteaza lista</CButton>
                </CButtonGroup>
              </CCol>
              <CCol col="6" sm="6" md="6" xl="6" className="mb-3 mb-xl-0 text-right">
                <CButtonGroup>
                  <CButton color="success" onClick={showTeams} >Afiseaza echipele</CButton>
                  <CButton color="danger" onClick={() => createTeams()}>Genereaza echipele</CButton>
                </CButtonGroup>
              </CCol>
            </CRow>
          </CCardHeader>
          <CCardBody>
          <CDataTable
            items={playersDataSheet}
            fields={[
              { key: 'switch', label: 'Participa', _style: { width: '1%'}, sorter: true },
              { key: 'name', _classes: 'font-weight-bold', _style: { width: '30%'} },
              { key: 'phone', label: 'Telefon' },
              { key: 'note', label: 'Nota' },
              { key: 'pozitiile', label: 'Pozitii de joc' },
              { key: 'show_details', label: '', _style: { width: '1%' }, filter: false }
            ]}
            tableFilter={{placeholder: "nume | telefon"}}
            itemsPerPageSelect={{label: 'Jucaroti pe pagina', values:[20,50,100]}}
            onPaginationChange={(e)=>{setPerpage(e)}}
            hover
            striped
            itemsPerPage={perpage}
            activePage={page}
            scopedSlots = {{
              'switch':
                (item)=>{
                  return(
                    <td className="py-2">
                      <CSwitch size={'sm'} className={'mx-1'} shape={'pill'} color={'success'} variant={'opposite'} labelOn={'\u2713'} labelOff={'\u2715'}
                               onClick={() => togglePlayer(item.id)}
                               checked={players.includes(item.id)}
                               onChange={()=>{}}
                      />
                    </td>
                  )
              },
              'pozitiile':
                (item)=>{
                  return(
                    <td className="py-2">
                      {item.pozitiile.split('.').map(p=>getPositions(p)).join('->')}
                    </td>
                  )
              },
              'show_details':
                (item, index)=>{
                    return (
                    <td className="py-2">
                    <CButton
                    color="primary"
                    variant="outline"
                    shape="square"
                    size="sm"
                    onClick={()=>{toggleDetails(index)}}
                    >
                      {details.includes(index) ? 'Hide' : 'Show'}
                    </CButton>
                    </td>
                    )
                },
              'details':
                (item, index)=>(
                  <CCollapse show={details.includes(index)}>
                    <CCardBody>
                      <CRow>
                        <CCol lg="8" className="py-3">
                          <CInputGroup>
                            <CInputGroupPrepend><CInputGroupText className={'bg-info text-white'}>Nota</CInputGroupText></CInputGroupPrepend>
                            {editMode.includes(item.idRow)
                              ? <CInput value={editPlayer.note} name="note" type={'number'} min={0} max={10} onChange={(e) => editPlayerData({id: item.idRow, data: e.target})}/>
                              : <CInput value={item.note} name="note" disabled/>
                            }
                          </CInputGroup>
                          <br/>
                          <CInputGroup>
                            <CInputGroupPrepend><CInputGroupText className={'bg-info text-white'}>Telefon</CInputGroupText></CInputGroupPrepend>
                            {editMode.includes(item.idRow)
                              ? <CInput value={editPlayer.phone} type={'number'} name="phone" onChange={(e) => editPlayerData({id: item.idRow, data: e.target})}/>
                              : <CInput value={item.phone} name="phone" disabled />
                            }
                          </CInputGroup>
                          <br/>
                          <CInputGroup>
                            <CInputGroupPrepend><CInputGroupText className={'bg-info text-white'}>Pozitii de joc</CInputGroupText></CInputGroupPrepend>
                            {editMode.includes(item.idRow)
                              ? <CInput value={editPlayer.pozitiile} name="pozitiile" onChange={(e) => editPlayerData({id: item.idRow, data: e.target})}/>
                              : <CInput value={item.pozitiile} name="pozitiile" disabled/>
                            }
                          </CInputGroup>
                          <CFormText className="help-block">1: Att, 2: Mid, 3: Def, 4: Gk</CFormText>

                          <br/>
                          {editMode.includes(item.idRow)
                            ?
                            <CButtonGroup>
                              <CButton color="success" onClick={updatePlayerData}>Update</CButton>
                              <CButton color="danger" onClick={() => toggleEditMode([])}>Cancel</CButton>
                            </CButtonGroup>
                            :
                            <CButton color="warning" onClick={() => toggleEditMode([item.idRow])}>Edit</CButton>
                          }
                        </CCol>
                        <CCol md="4" className="py-3">
                          {( item.photo === 'default') ? 'No Image' : <CCardImg src={item.photo} /> }
                        </CCol>
                      </CRow>
                    </CCardBody>
                  </CCollapse>
                )
            }}
          />
          <CPagination
            activePage={page}
            onActivePageChange={pageChange}
            pages={pages}
            align="center"
          />
          </CCardBody>
        </CCard>
      </CCol>
      : ''}
      {Object.keys(toasters).map((toasterKey) => (
        <CToaster
          position={toasterKey}
          key={'toaster' + toasterKey}
        >
          {
            toasters[toasterKey].map((toast, key)=>{
              return(
                <CToast
                  key={'toast' + key}
                  show={true}
                  autohide={toast.autohide}
                  fade={toast.fade}
                >
                  <CToastHeader closeButton={toast.closeButton}>
                    {['full', 'low', 'pass'].includes(toast.type) ? `Atentie!` : `Jucatori`}
                  </CToastHeader>
                  <CToastBody>
                    {renderToast(toast)}
                  </CToastBody>
                </CToast>
              )
            })
          }
        </CToaster>
      ))}
      <CModal
        show={modal}
        onClose={setModal}
      >
        <CModalHeader closeButton>
          <CModalTitle>Echipe</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {(teams.length < 1)
            ? 'No teams'
            : <CRow>
              <CCol col="6" className="bg-info py-3">
                {
                  teams[0].map((pl, i) => {
                    scoreTeam1 += parseFloat(pl.note);
                    return <p
                      key={pl.id}>{`${i + 1}: `}<b>{`${pl.name}`}</b> : {getPositions(pl.pozitiile.split('.')[0])} : {pl.note}
                    </p>;
                  })
                }
                <h3>Suma: {scoreTeam1.toFixed(2)}</h3>
                <h5>Media: {(scoreTeam1 / 6).toFixed(2)}</h5>
              </CCol>
              <CCol col="6" className="bg-warning py-3">
                {
                  teams[1].map((pl, i) => {
                    scoreTeam2 += parseFloat(pl.note);
                    return <p
                      key={pl.id}>{`${i + 1}: `}<b>{`${pl.name}`}</b> : {getPositions(pl.pozitiile.split('.')[0])} : {pl.note}
                    </p>;
                  })
                }
                <h4>Suma: {scoreTeam2.toFixed(2)}</h4>
                <h5>Media: {(scoreTeam2 / 6).toFixed(2)}</h5>
              </CCol>
            </CRow>
          }
        </CModalBody>
        <CModalFooter>
          <CButtonGroup>
            <CButton onClick={() => createTeams('position')} color="success">by Position</CButton>{' '}
            <CButton onClick={() => createTeams('top')} color="warning">by Top</CButton>
            <CButton onClick={() => createTeams('random')} color="danger">by Random</CButton>
          </CButtonGroup>
          <CButton
            color="secondary"
            onClick={() => setModal(false)}
          >Close</CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default Players
