package me.john.amiscaray.commissionbackend.dto.game

data class JudgeAction(val subject: Long, val drawing: String, val type: JudgeActionType, val winner: Long=-1) {

    enum class JudgeActionType{

        JUDGED,
        CHOSE_SOMETHING_TO_DRAW

    }

}