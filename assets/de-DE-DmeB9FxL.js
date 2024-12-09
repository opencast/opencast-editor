const e={"cutting-button":"Schneiden","finish-button":"Fertigstellen","select-tracks-button":"Spuren","subtitles-button":"Untertitel","thumbnail-button":"Vorschaubild","metadata-button":"Metadaten","keyboard-controls-button":"Tastatursteuerung","tooltip-aria":"Hauptnavigation"},t={"cut-button":"Schneiden","cut-tooltip":"Segment an der aktuellen Position der Zeitleiste teilen. Hotkey: {{hotkeyName}}","cut-tooltip-aria":"Schneiden. Teilt das Segment an der aktuellen Position des Zeitmarkers. Hotkey: {{hotkeyName}}.","delete-button":"Löschen","delete-restore-tooltip":"Markieren oder entfernen Sie das Segment an der aktuellen Position zur Löschung. Hotkey: {{hotkeyName}}","delete-restore-tooltip-aria":"Delete and Restore. Mark or unmark the segment at the current position as to be deleted. Hotkey: {{hotkeyName}}.","merge-all-button":"Alle zusammenführen","merge-all-tooltip":"Alle Segmente in ein einziges Segment zusammenführen.","merge-all-tooltip-aria":"Alle Segmente in ein einziges Segment zusammenführen.","restore-button":"Wiederherstellen","mergeLeft-button":"Links zusammenfügen","mergeLeft-tooltip":"Verbinde das aktuell aktive Segment mit dem Segment auf der linken Seite. Hotkey: {{hotkeyName}}","mergeLeft-tooltip-aria":"Links zusammenfügen. Verbinden Sie das aktuell aktive Segment mit dem Segment auf der linken Seite. Hotkey: {{hotkeyName}}.","mergeRight-button":"Rechts zusammenfügen","mergeRight-tooltip":"Verbinde das aktuell aktive Segment mit dem Segment auf der rechten Seite. Hotkey: {{hotkeyName}}","mergeRight-tooltip-aria":"Rechts zusammenfügen. Verbinden Sie das aktuell aktive Segment mit dem Segment auf der rechten Seite. Hotkey: {{hotkeyName}}.",zoom:"Zoom","zoomSlider-aria":"Zoomen. Zoome in die Zeitleiste herein oder aus ihr heraus. Hotkey fürs Hereinzoomen: {{hotkeyNameIn}}. Hotkey fürs Herauszoomen: {{hotkeyNameOut}}.","zoomSlider-tooltip":"Zoome in die Zeitleiste herein oder aus ihr heraus. Hotkey fürs Hereinzoomen: {{hotkeyNameIn}}. Hotkey fürs Herauszoomen: {{hotkeyNameOut}}.",zoomIn:"Hereinzoomen",zoomOut:"Herauszoomen"},n={previewButton:"Vorschaumodus","previewButton-tooltip":"Überspringt gelöschte Segmente bei der Wiedergabe des Videos. Derzeit {{status}}. Hotkey: {{hotkeyName}}","previewButton-aria":"Vorschaumodus aktivieren oder deaktivieren. Hotkey: {{hotkeyName}}.","playButton-tooltip":"Video wiedergeben","pauseButton-tooltip":"Video pausieren",previousButton:"Zurück","previousButton-tooltip":"Zurück. Hotkey: {{hotkeyName}}.",nextButton:"Vorwärts","nextButton-tooltip":"Vorwärts. Hotkey: {{hotkeyName}}.","current-time-tooltip":"Aktuelle Zeit","time-duration-tooltip":"Videodauer","duration-aria":"Dauer","time-aria":"Aktuelle Zeit","mutebutton-tooltip":"Video stumm schalten","unmutebutton-tooltip":"Videoton aktivieren","volume-tooltip":"Lautstärke anpassen: {{current}}%","volumeSlider-aria":"Lautstärke des Videos anpassen.","comError-text":"Bei der Kommunikation mit Opencast ist ein Problem aufgetreten.","loadError-text":"Beim Laden des Videos ist ein Fehler aufgetreten.","durationError-text":"Opencast konnte die Video-Dauer nicht angeben.","title-tooltip":"Videotitel","presenter-tooltip":"Vortragende"},i={"save-button":"Änderungen speichern","start-button":"Speichern und Änderungen verarbeiten","discard-button":"Änderungen verwerfen"},r={"headline-text":"Aktuelles Projekt speichern","confirm-button":"Ja, Änderungen speichern","confirmButton-attempting-tooltip":"Versuche zu speichern","confirmButton-success-tooltip":"Erfolgreich gespeichert","confirmButton-failed-tooltip":"Speichern fehlgeschlagen","info-text":"Das Video wird nicht verarbeitet, aber alle Schnittinformationen werden in Opencast gespeichert. Sie können Ihre Bearbeitung später fortsetzen.","success-text":"Änderungen erfolgreich gespeichert! Sie können den Editor nun schließen oder weiter arbeiten.","success-tooltip-aria":"Erfolgreich gespeichert","saveArea-tooltip":"Speicherbereich","confirm-success":"Okay","cancel-save":"Nicht speichern"},o={"headline-text":"Änderungen verwerfen","confirm-button":"Ja, Änderungen verwerfen","info-text":"Sind Sie sicher, dass Sie diese Änderung verwerfen möchten? Dies kann nicht rückgängig gemacht werden!"},a={"discarded-text":"Ihre Änderungen wurden verworfen. Sie können den Editor nun schließen.","startOver-button":"Von neuem beginnen!","startOver-tooltip":"Seite neu laden, um neu zu starten","info-text":`Änderungen erfolgreich in Opencast gespeichert. Die Bearbeitung Ihrer Änderungen kann einige Zeit dauern, bitte haben Sie etwas Geduld. Sie können nun den Editor schließen.
`},s={"saveAndProcess-text":"Speichern & verarbeiten","selectWF-text":"Workflow wählen","noWorkflows-text":`Es gibt keine Workflows zum Verarbeiten Ihrer Änderungen. Bitte speichern Sie Ihre Änderungen und kontaktieren Sie einen Administrator.
`,"oneWorkflow-text":`Die Änderungen werden gespeichert und das Video wird mit dem Workflow "{{workflow}}" geschnitten und verarbeitet. <3/> Dies wird einige Zeit in Anspruch nehmen.
`,"manyWorkflows-text":"Wählen Sie aus, welchen Workflow Opencast für die Verarbeitung verwenden soll.","startProcessing-button":"Verarbeitung starten","back-button":"Zurück","selectWF-button":"Klicken, um diesen Workflow auszuwählen","selectWF-button-aria":`Klicken, um den Workflow auszuwählen: {{stateName}}
`},l={"generateWaveform-text":"Waveform wird generiert","segment-tooltip":"Segment {{segment}}","scrubber-text-aria":`Zeitmarker. {{currentTime}}. Aktives Segment: {{segment}}. {{segmentStatus}}. Steuerung: {{moveLeft}} und {{moveRight}}, um den Zeitmarker zu bewegen. {{increase}} und {{decrease}}, um das Verschiebungdelta zu erhöhen/verringern.
`,"segments-text-aria":`Segment {{index}}. {{segmentStatus}}. Start: {{start}}. Ende: {{end}}.
`,"cut-text-aria":`Schnittmarke. {{time}}. Zwischen Segment {{leftSegment}} und {{rightSegment}}.
`},u={"headline-text":"Workflow Konfiguration","satisfied-text":"Sind Sie zufrieden mit Ihrer Konfiguration?","confirm-button":"Ja, Verarbeitung starten"},d={"EVENTS-EVENTS-DETAILS-CATALOG-EPISODE":"Video Metadaten","submit-button":"Abschicken","submit-button-tooltip":"Bestätigen Sie Ihre Änderungen","reset-button":"Zurücksetzen","reset-button-tooltip":"Alle Änderungen rückgängig machen","submit-helpertext":`Machen Sie so viele Änderungen, wie Sie möchten, dann drücken Sie den {{buttonName}} Button.
Beachten Sie, dass Sie noch die Verarbeitung starten müssen, damit Ihre Änderungen wirksam werden.`,validation:{required:"Erforderlich","duration-format":"Format muss HH:MM:SS sein",datetime:"Ungültig"},labels:{title:"Titel",subject:"Betreff",description:"Beschreibung",language:"Sprache",rightsHolder:"Rechte",license:"Lizenz",isPartOf:"Serie",creator:"Vortragende(r)",contributor:"Mitwirkende(r)",startDate:"Startdatum",duration:"Dauer",location:"Ort",source:"Quelle",created:"Erstellt am",publisher:"Herausgeber",identifier:"UID"},language:{"LANGUAGES-SLOVENIAN":"Slowenisch","LANGUAGES-PORTUGESE":"Portugiesisch","LANGUAGES-ROMANSH":"Rätoromanisch","LANGUAGES-ARABIC":"Arabisch","LANGUAGES-POLISH":"Polnisch","LANGUAGES-ITALIAN":"Italienisch","LANGUAGES-CHINESE":"Chinesisch","LANGUAGES-FINNISH":"Finnisch","LANGUAGES-DANISH":"Dänisch","LANGUAGES-UKRAINIAN":"Ukrainisch","LANGUAGES-FRENCH":"Französisch","LANGUAGES-SPANISH":"Spanisch","LANGUAGES-GERMAN_CH":"Schweizerdeutsch","LANGUAGES-NORWEGIAN":"Norwegisch","LANGUAGES-RUSSIAN":"Russisch","LANGUAGES-JAPANESE":"Japanisch","LANGUAGES-DUTCH":"Niederländisch","LANGUAGES-TURKISH":"Türkisch","LANGUAGES-HINDI":"Hindi","LANGUAGES-SWEDISH":"Schwedisch","LANGUAGES-ENGLISH":"Englisch","LANGUAGES-GERMAN":"Deutsch"},license:{"EVENTS-LICENSE-CC0":"CC0","EVENTS-LICENSE-CCBYND":"CC-BY-ND","EVENTS-LICENSE-CCBYNCND":"CC-BY-NC-ND","EVENTS-LICENSE-CCBYNCSA":"CC-BY-NC-SA","EVENTS-LICENSE-ALLRIGHTS":"Alle Rechte vorbehalten","EVENTS-LICENSE-CCBYSA":"CC-BY-SA","EVENTS-LICENSE-CCBYNC":"CC-BY-NC","EVENTS-LICENSE-CCBY":"CC-BY"},"calendar-prev":"Vorherige","calendar-next":"Nächste"},c={title:"Vorschaubildeditor",noThumbnailAvailable:"Kein Vorschaubild verfügbar",previewImageAlt:"Vorschaubild für Spur",buttonGenerate:"Generieren","buttonGenerate-tooltip":"Erstelle ein neues Vorschaubild aus der aktuellen Position des Zeitmarkers","buttonGenerate-tooltip-aria":"Erstelle ein neues Vorschaubild aus der aktuellen Position des Zeitmarkers",buttonUpload:"Hochladen","buttonUpload-tooltip":"Ein Bild hochladen","buttonUpload-tooltip-aria":"Ein Bild hochladen",buttonUseForOtherThumbnails:"Für alle Spuren verwenden","buttonUseForOtherThumbnails-tooltip":"Benutze das Vorschaubild für alle Spuren","buttonUseForOtherThumbnails-tooltip-aria":"Benutze das Vorschaubild für alle Spuren",buttonDiscard:"Verwerfen","buttonDiscard-tooltip":"Verwerfe Vorschaubild für diese Spur","buttonDiscard-tooltip-aria":"Verwerfe Vorschaubild für diese Spur",buttonGenerateAll:"Alle generieren","buttonGenerateAll-tooltip":"Erstelle ein neues Vorschaubild für alle Spuren aus der aktuellen Position des Zeitmarkers","buttonGenerateAll-tooltip-aria":"Erstelle ein neues Vorschaubild für alle Spuren aus der aktuellen Position des Zeitmarkers",explanation:"Erstelle oder lade ein Vorschaubild für jede Spur hoch.",primary:"Primär",secondary:"Sekundär"},h={rowTitle:"Vorschaubilder hier ändern",from:"von"},m={"generic-message":"Ein kritischer Fehler ist aufgetreten!",details:"Details: ","workflowActive-errorTitle":"Vorübergehend nicht verfügbar","workflowActive-errorMessage":"Dieses Video wird verarbeitet Bitte warten Sie, bis der Prozess abgeschlossen ist."},g={"main-heading":"Willkommen im Video-Editor","contact-admin":"Falls Sie versucht haben, ein bestimmtes Video zu bearbeiten, aber diese Seite sehen, wenden Sie sich bitte an Ihren Administrator.","start-editing-1":"Um mit der Bearbeitung zu beginnen, geben Sie den Parameter an ","start-editing-2":" mit der Mediapaket ID des Videos, das Sie bearbeiten möchten.","link-to-documentation":"Weitere Informationen zur Konfiguration des Video-Editors finden Sie im Administrationshandbuch unter "},S={"error-details-text":`Details: {{errorMessage}}
`,"error-text":"Ein Fehler ist aufgetreten. Bitte versuchen Sie es später noch einmal.","goBack-button":"Nein, zurück","callback-button-system":"Zurück zu {{system}}","callback-button-generic":"Zurück zu vorherigem System"},b={title:"Spur(en) für die Verarbeitung auswählen",trackInactive:"inaktiv",deleteTrackText:"Spur löschen",restoreTrackText:"Spur wiederherstellen",cannotDeleteTrackText:"Spur kann nicht gelöscht werden",deleteTrackTooltip:"Diese Spur nicht verarbeiten und veröffentlichen.",restoreTrackTooltip:"Diese Spur verarbeiten und veröffentlichen.",cannotDeleteTrackTooltip:"Diese Spur kann nicht entfernt werden."},p={"selectSubtitleButton-tooltip":"Untertitel für {{title}} bearbeiten","selectSubtitleButton-tooltip-aria":"{{title}} zur Bearbeitung von Untertiteln auswählen","createSubtitleButton-tooltip":"Öffnet einen Dialog zum Erstellen/Hochladen neuer Untertitel","createSubtitleButton-clicked-tooltip-aria":"Enthält einen Dialog zum Erstellen neuer Untertitel","createSubtitleButton-createButton":"Erstellen","createSubtitleButton-createButton-tooltip":"Beginne eine neue Untertiteldatei mit dem ausgewählten Titel.","createSubtitleButton-createButton-disabled-tooltip":"Bitte wählen Sie eine Sprache aus der Dropdown-Liste.","createSubtitleDropdown-label":"Wähle eine Sprache",backButton:"Zurück","backButton-tooltip":"Zurück zur Untertitelauswahl","downloadButton-title":"Herunterladen","downloadButton-tooltip":"Untertitel als vtt-Datei herunterladen","uploadButton-title":"Hochladen","uploadButton-tooltip":"Untertitel als vtt-Datei hochladen","uploadButton-warning-header":"Achtung!","uploadButton-warning":"Hochladen wird den aktuellen Untertitel überschreiben. Dies kann nicht rückgängig gemacht werden. Sind Sie sicher?","uploadButton-error":"Hochladen fehlgeschlagen.","uploadButton-error-filetype":"Falsches Dateiformat.","uploadButton-error-parse":"Untertiteldatei konnte nicht analysiert werden. Bitte stellen Sie sicher, dass die Datei gültiges WebVTT enthält.",editTitle:"Untertitel-Editor - {{title}}","editTitle-loading":"Lädt",generic:"Unspezifiziert",autoGenerated:"Automatisch generiert"},k={"startTime-tooltip":"Beginn des Segments","startTime-tooltip-aria":"Beginnt bei","endTime-tooltip":"Ende des Segments","endTime-tooltip-aria":"Endet bei",addSegmentAbove:"Segment oberhalb hinzufügen",addSegmentBelow:"Segment unterhalb hinzufügen",jumpToSegmentAbove:"Zum Segment oberhalb springen",jumpToSegmentBelow:"Zum Segment unterhalb springen",deleteSegment:"Segment löschen"},f={selectVideoLabel:"Video Flavors"},E={overviewTimelineTooltip:"Zeitleiste-Übersicht"},A={header:"Tastenkürzel",defaultGroupName:"Allgemein",missingLabel:"Unbekannt",groupVideoPlayer:"Videoplayer",groupCuttingView:"Schneiden",groupCuttingViewScrubber:"Zeitleiste",groupSubtitleList:"Untertitel",sequenceSeparator:"oder",genericError:"Fehler beim Laden der Übersicht",videoPlayButton:"Video abspielen/pausieren",scrubberLeft:"Nach links",scrubberRight:"Nach rechts",scrubberIncrease:"Schneller bewegen",scrubberDecrease:"Langsamer"},N={appearance:"Aussehen",dark:"Dunkel",light:"Hell",auto:"Auto","dark-high-contrast":"Dunkel (hoher Kontrast)","light-high-contrast":"Hell (hoher Kontrast)"},w={language:"Sprache"},V={areYouSure:"Sind Sie sicher?",cancel:"Abbrechen",close:"Schließen",confirm:"Bestätigen"},v={mainMenu:e,cuttingActions:t,video:n,finishMenu:i,save:r,discard:o,theEnd:a,workflowSelection:s,timeline:l,workflowConfig:u,metadata:d,thumbnail:c,thumbnailSimple:h,error:m,landing:g,various:S,trackSelection:b,subtitles:p,subtitleList:k,subtitleVideoArea:f,subtitleTimeline:E,keyboardControls:A,theme:N,language:w,modal:V};export{t as cuttingActions,v as default,o as discard,m as error,i as finishMenu,A as keyboardControls,g as landing,w as language,e as mainMenu,d as metadata,V as modal,r as save,k as subtitleList,E as subtitleTimeline,f as subtitleVideoArea,p as subtitles,a as theEnd,N as theme,c as thumbnail,h as thumbnailSimple,l as timeline,b as trackSelection,S as various,n as video,u as workflowConfig,s as workflowSelection};