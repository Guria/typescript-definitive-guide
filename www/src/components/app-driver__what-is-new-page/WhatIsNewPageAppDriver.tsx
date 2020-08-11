import React, { FC, ReactNode } from "react";
import { AppDriver } from "../app-driver/AppDriver";
import { default as cn } from "classnames";
import { FooterAppDriver } from "../app-driver__footer/FooterAppDriver";
import { Link } from "gatsby";
import { Version } from "../../utils/Version";
import { observer } from "mobx-react-lite";
import { useRouter } from "../../stores/RouterStore";
import { AppNavSectionAppDriver } from "../app-driver__nav-section_app-nav/AppNavSectionAppDriver";
import { ContentNavSectionAppDriver } from "../app-driver__nav-section_page-nav/ContentNavSectionAppDriver";
import { useWhatIsNewPageStores } from "../../stores/mobx-entry__what-is-new";

interface IWhatIsNewPageAppDriverProps {
}

export interface ILinkAppDriverData {
  path:string;
  name:string;
  isActive:boolean;
  activeClassName:string;
  disabled?:boolean;
}
export interface ILinkAppDriverProps extends ILinkAppDriverData{
  onClick?:()=>void;
}

export const LinkAppDriver: FC<ILinkAppDriverProps> = ( { path, name, isActive, activeClassName ,onClick,disabled=false} ) => {
  let classes = cn( `app-driver__link`, {
    [ activeClassName ]: isActive,
    [ `app-driver__link_disabled` ]: disabled
  } );
  let linkProps = { className: classes };


  return (
    <div className="app-driver__list-item">
      <Link className="app-driver__list-item"
            to={ path }
            getProps={ () => linkProps }
            onClick={onClick}>
        { name }
      </Link>
    </div>

  );
};


export const WhatIsNewPageAppDriver: FC<IWhatIsNewPageAppDriverProps> = observer( ( {} ) => {
  let { winTocTreeStore } = useWhatIsNewPageStores();
  let routerStore = useRouter();
  let { contentSection, versionFilter } = useWhatIsNewPageStores();


  let innovationAll = winTocTreeStore.getInnovationAllByVersionMMP( routerStore.pageName );


  const hasPageNavLinkActive = ( href: string, anchor: string ) =>
    anchor === contentSection.currentSectionId;


  if ( !innovationAll ) {
    throw new Error( "Innovation not found" );
  }


  let navItemAll = innovationAll.map( innovation => ( {
    path: `${ routerStore.pathname }#${ innovation.path }`,
    name: innovation.innovationName,
    anchor: innovation.path,
    version: new Version( innovation.version ).preReleaseName
  } ) );


  let contentNavLinkDataAll = navItemAll.map( ( { name, path, anchor, version }, index ) => ( {
    name,
    path,
    isActive: hasPageNavLinkActive( path, anchor ),
    disabled: !versionFilter.isCheckedByVersion( version ),
    activeClassName: "app-driver__link_page-nav-item_active"
  } ) );


  return (
    <AppDriver>
      <AppNavSectionAppDriver/>
      <ContentNavSectionAppDriver contentNavLinkDataAll={contentNavLinkDataAll}/>
      <FooterAppDriver/>
    </AppDriver>
  );
} );
