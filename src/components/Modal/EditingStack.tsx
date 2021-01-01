import React, { useCallback, useEffect, useState, useMemo } from "react";

import history from 'historyApp';
import { useLocation } from "react-router-dom";
import { FormattedMessage, useIntl } from 'react-intl';

import {useSelector, useDispatch} from "react-redux";
import {StateRoot} from 'store/reducers';
import * as actionsStatus from 'store/actions/status';
import * as actionsStack from 'store/actions/stack';

import {pascalToCamel} from 'tools/vanilla/convertName';
import useInput from 'tools/hooks/useInput';


import IconX from 'svgs/basic/IconX';
import IconCheck from 'svgs/basic/IconCheck';

import styles from './EditingStack.module.scss';
import stylesCreatingPortal from './CreatingPortal.module.scss';

import stylesModal from 'components/Modal.module.scss';


type PropsEditingStack = {};

function EditingStack({}: PropsEditingStack) {
  
    const dispatch = useDispatch();
    const intl = useIntl();

    const idUserInApp = useSelector((state: StateRoot) => state.auth.user?.id);
    const idStackEditing:string = useSelector((state: StateRoot) => state['status']['current']['stack']['editing']);
    const listStack:any[] = useSelector((state: StateRoot) => state['stack']['listStack']);

/*
    useEffect( ():any=>{
        return (
            dispatch(actionsStatus.return__REPLACE({
                listKey: ['current', 'stack', 'editing'], 
                replacement: ''
            })) 
        )
    },[]); */ 

    const stackEditing: any = useMemo(()=>{
        return listStack.find(stackEach => stackEach.id === idStackEditing);
    },[idStackEditing, listStack])

    const onClick_HideModal = useCallback(
        () => {
            dispatch(actionsStatus.return__REPLACE({ 
                listKey: ['showing', 'modal', pascalToCamel('EditingStack')],
                replacement: false
            }));
        },[]
    );

    const onSubmit = useCallback( (event:React.FormEvent<HTMLFormElement>, draft:any) => {
        event.preventDefault();
        dispatch(actionsStack.return__MANIPULATE_STACK({
            kind: 'update',
            draft: draft,
            id: idStackEditing,
            idOwner: stackEditing.idUser,
        }));
    },[idStackEditing]);


    const [draft,setDraft] = useState({
        kind: stackEditing.kind as 'manual' | 'tag',
        name: stackEditing.name as string,

        listTag: stackEditing.listTag as string[],
        tagCurrent: stackEditing.tagCurrent as string,
        
        listIdPortal: stackEditing.listIdPortal as string[],

        // lifespan: '15' as string,  // if edited, apply to all each portals
    });
    
    const onChange_InputNormal = useCallback(
        (event:React.ChangeEvent<HTMLInputElement>) => {
            const draftReplacement = {
                ...draft, 
                [event.currentTarget.name]: event.currentTarget.value
            }
            setDraft(draftReplacement);
            console.log(draftReplacement);
        },[draft]
    ); 

    const onChange_InputCheckbox = useCallback(
        (event:React.ChangeEvent<HTMLInputElement>) => {
            const idPortalClicked = event.currentTarget.value;
            let replacement = draft.listIdPortal;
            if (draft.listIdPortal.includes(idPortalClicked)){
                replacement = draft.listIdPortal.filter(idPortalEach => idPortalEach !== idPortalClicked);
            }
            else {
                replacement.push(idPortalClicked)
            }
            setDraft({
                ...draft,
                listIdPortal: draft.listIdPortal,
            });
        },[draft]
    ); 
    

    const onClick_AddTagCurrent = useCallback(
        () => {
            const {tagCurrent, listTag} = draft;
            if ( tagCurrent !== "" && !listTag.includes(tagCurrent) ){
                const listTagReplacement = [...listTag, tagCurrent];
                setDraft({
                    ...draft,
                    listTag: listTagReplacement
                });
            }
        },[draft]
    );

    const onClick_DeleteTag = useCallback(
        (tagDeleting:string) => {
            const {listTag} = draft;
            const listTagReplacement = listTag.filter(tagEach => tagEach !== tagDeleting);
            setDraft({
                    ...draft,
                    listTag: listTagReplacement
                });
        },[draft]
    );
    


    const onClick_DeleteStack = useCallback(
        () => {
            const ok = window.confirm(intl.formatMessage({ id: 'Page.Home_ConfirmDeletingStack'}));
                if (ok) {
                    dispatch(actionsStack.return__DELETE_STACK({
                        id: idStackEditing,
                        idUser: idUserInApp // owner of this stack
                    }));                
                }
        }, [idStackEditing, idUserInApp]
    );

  
  return (
    <div className={`${styles['styles']} ${stylesCreatingPortal['root']} ${stylesModal['root']}`} >

        <div 
            className={`${stylesModal['outside']}`} 
            onClick={()=>onClick_HideModal()}
        />

        <div 
            className={`${stylesModal['modal']}`} 
        >
            <div className={`${stylesModal['header']}`} >
                <div>  <FormattedMessage id={`Modal.EditingStack_Title`} /> </div>
                <div
                    onClick={()=>onClick_HideModal()}
                > 
                    <IconX className={`${stylesModal['icon-x']}`} />
                </div>
            </div>
        
            <form 
                className={`${stylesModal['content']}`} 
                onSubmit={(event)=>onSubmit(event, draft)}
            >
                

                <div className={`${stylesModal['content__section']}`} >
                    <div>  <FormattedMessage id={`Modal.CreatingStack_Kind`} /></div>

                    <div className={'container__input-radio'} > 
                        <input type="radio" name="kind" value="manual" defaultChecked={draft.kind === 'manual'}
                            id="kind----manual"
                            onChange={onChange_InputNormal} 
                        /> <label htmlFor="kind----manual">manual</label>

                        <input type="radio" name="kind" value="tag" defaultChecked={draft.kind === 'tag'}
                            id="kind----tag"
                            onChange={onChange_InputNormal} 
                        /> <label htmlFor="kind----tag">tag</label>
                    </div>
                </div>


                <div className={`${stylesModal['content__section']}`} >
                    <div> <FormattedMessage id={'Global.Name'} /> </div>
                    <div className={`${stylesCreatingPortal['container__input-name']}`} >
                        <input 
                            type='text'
                            placeholder={intl.formatMessage({ id: 'Global.Name'})}
                            name='name'
                            value={draft.name}
                            onChange={onChange_InputNormal} 
                        /> 
                    </div>
                </div>

                {draft.kind === 'tag' && 
                <div className={`${stylesModal['content__section']}`} >
                    <div>  <FormattedMessage id={`Modal.CreatingPortal_Tags`} /></div>

                    <div className={`${stylesCreatingPortal['list-tag']}`} > 
                        {draft.listTag.map((tag, index)=>
                            <div
                                key={`tag-${index}`}
                            >
                                <div> 
                                    {tag}
                                </div>
                                <div
                                    onClick={()=>onClick_DeleteTag(tag)}
                                > <IconX className={`${stylesCreatingPortal['icon-x']}`} /> </div>
                            </div>)}
                    </div>

                    <div className={`${stylesCreatingPortal['container__input-tag-current']}`} >
                        <input 
                            type='text'
                            placeholder={intl.formatMessage({ id: 'Modal.CreatingPortal_Tags'})}
                            name='tagCurrent'
                            value={draft.tagCurrent}
                            onChange={onChange_InputNormal} 
                        />
                        <button
                            onClick={()=>onClick_AddTagCurrent()}
                        > Add </button>
                    </div>
                </div>
                }
                

                { (draft.kind === 'manual') && 
                    <div className={`${stylesModal['content__section']}`} >
                        <div> <FormattedMessage id={`Modal.AddingPortalToStack_Choose`} /> </div>
                        <ul className={`${styles['collection-checkbox']}`} >
                        {stackEditing?.listPortal.map(( portal, index)=>{
                            
                            return (
                                <li
                                    key={`stack-${index}`}
                                    className={'container__input-checkbox'}
                                >   
                                    <input 
                                        type="checkbox" 
                                        id={`checkbox-${portal?.id}`}
                                        name="idStack"
                                        value={portal?.id}
                                        defaultChecked={ portal?.listIdPortal.includes(idPortal) }
                                        onChange={onChange_InputCheckbox} 
                                    /> 
                                    <label htmlFor={`checkbox-${portal?.id}`}>  
                                        <div> <IconCheck className={`${styles['icon-check']}`} kind='solid' /> </div>
                                        <div> {portal?.name} </div> 
                                    </label>
                                </li> 
                            )
                        })}
                        </ul>
                    </div>
                }


                <div className={`${stylesModal['content__section']}`} >
                    <input
                        type="submit"
                        value={intl.formatMessage({ id: 'Global.Update'})}
                    />
                </div>

                <div className={`${stylesModal['content__section']}`} >
                    <button
                        className={`${stylesModal['button-delete']}`}
                        onClick={()=>onClick_DeleteStack()}
                    > <FormattedMessage id={'Global.Delete'} /> </button>
                </div>

            </form>
        </div>

    </div>
  );
}

EditingStack.defaultProps = {};

export default EditingStack;


