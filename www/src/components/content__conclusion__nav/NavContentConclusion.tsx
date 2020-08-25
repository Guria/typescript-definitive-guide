import React, { FC } from "react";
import { BackArrowSvgIcon, ForwardArrowSvgIcon } from "../icon__svg-icon/svg-icons";
import { useTranslator } from "../../react__hooks/translator.hook";
import {
  AppContentLocalization,
  LocalizationPaths
} from "../../localization";
import { useContentNavStore } from "../../mobx__mobx-shared-store__react-context/ContentNavStoreMobxContext";
import { observer } from "mobx-react-lite";

interface INavContentConclusionProps {
}

export const NavContentConclusion: FC<INavContentConclusionProps> = observer(() => {
  let [appContent] = useTranslator<[AppContentLocalization]>(
    LocalizationPaths.AppContent
  );
  let contentNav = useContentNavStore();


  return (
    <nav className="content-conclusion__nav">
      <button className="conclusion-button conclusion-button_prev"
              onClick={ () => contentNav.goPrevPage() }
              disabled={ !contentNav.hasPrevPage() }>
        <BackArrowSvgIcon className="conclusion-button__svg-icon"/>
        <span className="conclusion-label conclusion-label_prev">
          { contentNav.pageItem.prevPage?.name }
          </span>
        <span className="conclusion-label_placeholder_xs conclusion-label_prev">
            { appContent.contentNav.prevButton.label }
          </span>
      </button>
      <button className="conclusion-button conclusion-button_next"
              onClick={ () => contentNav.goNextPage() }
              disabled={ !contentNav.hasNextPage() }>
          <span className="conclusion-label conclusion-label_next">
            { contentNav.pageItem.nextPage?.name }
          </span>
        <span className="conclusion-label_placeholder_xs conclusion-label_next">
            { appContent.contentNav.nextButton.label }
          </span>
        <ForwardArrowSvgIcon className="conclusion-button__svg-icon"/>
      </button>
    </nav>
  );
});
