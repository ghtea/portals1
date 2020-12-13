import { call, select, put } from "redux-saga/effects";
import axios from "axios";
import queryString from 'query-string';
import { v4 as uuidv4 } from 'uuid';

// import * as config from 'config';
import {StateRoot} from 'store/reducers';
import * as actionsStatus from "store/actions/status";
import * as actionsNotification from "store/actions/notification";

import * as actionsPortal from "store/actions/portal";
//import * as actionsTheme from "../../actions/theme";


const requestGetListPortal = (queryRequestBefore: any) => {
    
    return axios.get(`${process.env.REACT_APP_URL_BACK}/portal/?${queryString.stringify(queryRequestBefore)}`)
        .then(response => { 
        	//console.log(response)
        	return {response};
        })
        .catch(error => {
            //console.log(error.response)
            return {error};
        });
};


function* getListPortal(action: actionsPortal.type__GET_LIST_PORTAL) {

    const readyUser: boolean =  yield select( (state:StateRoot) => state.status.ready.user); 
    
    try {

        if (!readyUser){
            console.log("should log in first");

        }
        else {
            
            const idUser: string =  yield select( (state:StateRoot) => state.auth.user._id); 

            const queryRequestBefore = {
                idUser: idUser
            };
            
           
            const {response, error} = yield call( requestGetListPortal, queryRequestBefore );
            
            console.log(response);
            console.log(error);

            if (response){
                const codeSituation = response.data.codeSituation;
                console.log(codeSituation);
                
                if (codeSituation === 'GetListPortal_Succeeded') {
                    yield put( actionsPortal.return__REPLACE({
                        listKey: ['listPortal'],
                        replacement: response.data.payload
                    }) );
                }

            }
            else {   

                //console.log(error)
                const codeSituation = error.reponse.data.codeSituation;
                console.log(codeSituation);

                yield put( actionsNotification.return__ADD_DELETE_BANNER({
                    codeSituation: codeSituation
                }) );
                
            }
              
            
        } // higher else
    

    // go to home
        
        
    } catch (error) {
        
        console.log(error);
        console.log('getListPortal has been failed');
        
        yield put( actionsNotification.return__ADD_DELETE_BANNER({
            codeSituation: 'GetListPortal_UnknownError'
        }) );
    }
}

export default getListPortal;
