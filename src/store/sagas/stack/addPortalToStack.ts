import { call, select, put, getContext } from "redux-saga/effects";
import { firebaseFirestore, firebaseStorage } from "firebaseApp";

import { v4 as uuidv4 } from "uuid";

// import * as config from 'config';
import {StateRoot} from 'store/reducers';
import * as actionsStatus from "store/actions/status";
import * as actionsNotification from "store/actions/notification";

import * as actionsStack from "store/actions/stack";
//import * as actionsTheme from "../../actions/theme";



const requestCreateStack = (stack: actionsStack.Stack) => {
    return firebaseFirestore.collection("Stack_").add(stack) 
};
const requestUpdateStack = (id:string, update:any) => {
    return firebaseFirestore.doc(`Stack_/${id}`).update({
      ...update
    });
};


function* addPortalToStack(action: actionsStack.type__ADD_PORTAL_TO_STACK) {

    const readyUser: boolean =  yield select( (state:StateRoot) => state.status.ready.user); 
    const idUserInApp = yield select((state:StateRoot)=>state.auth.user?.id);

    const history = yield getContext('history');
    
    const {kind, idPortal, nameStack, listIdStack} = action.payload;

    try {

        if (!readyUser){
            yield put(actionsNotification.return__ADD_DELETE_BANNER({
                codeSituation: 'NotLoggedIn__E'
            }) );
        }
        
        else if ( (kind === 'new') && (!nameStack) ){
            console.log('name for new stack is needed')
        }
        else if ( (kind === 'existing') && (!listIdStack) ) {
            console.log('list of id of stack is needed')
        }

        else {

            const date = Date.now();


            if (kind === 'new'){
                
                let stack:actionsStack.Stack = {
                    idUser: idUserInApp, 

                    kind: 'manual',
                    name: nameStack as string,
                    
                    listTag: [],
                    listIdPortal: [idPortal],
                };

                yield put(actionsStack.return__MANIPULATE_STACK({
                    kind: 'create',
                    draft: stack
                }))

            }
            else if (kind === 'existing') {

                const listStack = yield select ( (state:StateRoot) => state.stack.listStack); 
                // const stackEditing = listStack.find((stack:any) => stack.id === idStack);
 
                for (var iStack = 0; iStack < listStack?.length; iStack++){

                    let listIdPortal: string[] = listStack[iStack]['listIdPortal'];
                    listIdStack?.push(idPortal);
                    
                    let update: any = {
                        listIdPortal: listIdPortal
                    };

                    yield put(actionsStack.return__MANIPULATE_STACK({
                        kind: 'update',
                        draft: update,
                        id: listStack[iStack]['id']
                    }));
                }
                

            }

              
        }

    } catch (error) {
        
        console.log(error);
        
        yield put( actionsNotification.return__ADD_DELETE_BANNER({
            codeSituation: 'AddPortalToStack_UnknownError__E'
        }) );
    }
}

export default addPortalToStack;
