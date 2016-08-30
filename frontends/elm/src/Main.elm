import String exposing (toInt, isEmpty)
import Html exposing (Html, button, input, div, form, text, label, br)
import Html.App as App
import Html.Events exposing (onClick, onInput)
import Html.Attributes exposing (type', disabled)


type alias State =
  { name : String
  , group : Result String Int
  , turnTime : Result String Int
  }


initialState : State
initialState =
  { name = ""
  , group = Err ""
  , turnTime = Err ""
  }


type Msg = SetName String | SetGroup String | SetTurnTime String


main: Program Never
main =
    App.beginnerProgram { model = initialState, view = view, update = update }


update : Msg -> State -> State
update msg model =
  case msg of
    SetName name ->
      { model | name = name }

    SetGroup group ->
      { model | group = toInt group }

    SetTurnTime turnTime ->
      { model | turnTime = toInt turnTime }


successful : Result a b -> Bool
successful res =
    case res of
        Ok a ->
            True

        Err b ->
            False


view : State -> Html Msg
view {name, group, turnTime} =
  let
    nameGiven =
        not <| isEmpty name

    groupIdGiven =
        successful group

    turnTimeGiven =
        successful turnTime

  in
    form []
      [ label []
          [ text "Name"
          , input [ type' "text", onInput SetName ] []
          ]
      , br [] []
      , label []
        [ text "Group Id"
        , input [ type' "number", onInput SetGroup ] []
        ]
      , br [] []
      , text (toString groupIdGiven)
      , button [disabled <| not (nameGiven && groupIdGiven)]
          [text "Join Group"]
      , br [] []
      , label []
          [ text "Turn Time"
          , input [ type' "number", onInput SetTurnTime ] []
          ]
      , br [] []
      , button [disabled <| not (nameGiven && groupIdGiven && turnTimeGiven)]
          [text "Create Group"]
      ]
