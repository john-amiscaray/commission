package me.john.amiscaray.commissionbackend.dto

class ServerResponse(val message: String){

    companion object{

        val ROOM_FULL: String = "Room full."
        val GAME_STARTED: String = "The game you were looking for has started."
        val SERVER_ERROR: String = "Something happened with our server, we will try our best to fix it."

    }

}