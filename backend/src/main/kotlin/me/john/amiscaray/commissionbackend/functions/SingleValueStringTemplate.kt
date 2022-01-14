package me.john.amiscaray.commissionbackend.functions

fun interface SingleValueStringTemplate {

    fun with(value: String): String

}